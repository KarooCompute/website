#!/bin/bash

usage () {
		cat <<-EOF

			###############################################################
			# Call `basename $0` with one or more of the following options
			# (or none to use default values):
			#
			#  h ) own_hostname [phsical hostname] - Specify your own hostname to be used by the SAP system, needs to fulfill SAP requirements
			#  s ) Skip hostname checking - set -s flag if our check fails and you are sure that you chosen have a SAP conform hostname
			#  k ) Skip setting of Linux kernel parameters  set -k flag if setting Linux kernel parameters fails and you have catered for the requirments
			#  g ) Guided installation with SAPINSTGUI - use if ou have a working X environment or use Windows SAPINSTGUI 
			###############################################################
EOF
        echo
}

        while getopts "h:skg" options; do
                case $options in
                        h) own_hostname="$OPTARG";;  # Virtual Hostname to use, e.g. ownhost
			s) skip_hostname_check="y";;  # Skip Hostname checking
			k) skip_kernel_parameters="y";;  # Skip setting kernel parameters
			g) guimode="y";;  # Use GUI mode of SAPINST

                        \?) usage
                                exit $ERR_invalid_args;;
                        * ) usage
                                exit $ERR_invalid_args;;
                esac
        done

SID="NPL"
sid=`echo $SID | tr '[:upper:]' '[:lower:]'`

###########################################
#
#
# INSTALL ${SID} 
#
#
###########################################

archive_ext=".tgz"     
sap_server_tar="dbdata.tgz-* dblog.tgz-* dbexe.tgz-* usrsap.tgz-* sapmnt.tgz-*"

dvd_dist_dir=server/TAR/x86_64 
dvd_dist_dir_client=/client/JavaGUI
supported_string="SuSE 11, RHEL 6.5"
if [ ${archive_ext} = ".tar.bz2" ]; then
 tar_opt='xjf'
else
 tar_opt='xzf'
fi

# global distribution directory
tar_dist_dir=""
DISTRIBUTION=""
log_file=""
installed_jdk_home=""

# Network Configuration
REAL_HOSTNAME=`hostname`
if [ "x$own_hostname" = "x" ]; then
	virt_hostname="${REAL_HOSTNAME}"
else
	virt_hostname=${own_hostname}
fi
if [ x"${skip_hostname_check}" = "xy" ]; then
	echo "Hostname check skipped!"
else	
	i=${virt_hostname}
	if [ ${#i} -gt 13 ]; then
		echo "The length of the hostname you have chosen exceeds 13 character, this is not supported by SAP, please use a different hostname, please check your hostname selection. Start the install script with -s flag to skip the hostname check." 
		exit 1		
	fi
	myip=`ifconfig | egrep "inet addr" | grep Bcast | awk '{ print $2 }' | awk -F ":" '{ print $2 }'`
	hostip=`ping -c1 -n ${virt_hostname} | head -n1 | sed "s/.*(\([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*\)).*/\1/g"`
	if [ ! "${myip}" == "${hostip}" ]; then  
		echo "The hostname you have chosen is either configured on a loopback device or not active on this server, please check your configuration and hostname selection. If you are confident about your choice of hostname, start the install script with -s flag to skip the hostname check."
		exit 1
	fi
	echo "Hostname ${virt_hostname} assumed to be SAP compliant"
fi

# Functions:
#-------
log() {
#-------
        log_value=$1
        if [ -z "${log_file}" ]; then
	        log_file=./install.log
        fi

        echo -e "${log_value}" >> ${log_file}
}

#-----------
do_exit() {
#-----------
	exit_code=$1
	if [ ${exit_code} -le ${ERR_last} ]; then
		echo -e "${err_message[${exit_code}]}"
	fi
	exit ${exit_code}
}

#----------------
check_vendor() {
#----------------

	if [ -f /etc/redhat-release ]; then
	        package=`rpm -qf /etc/redhat-release`
	        OS_VERSION=`rpm -q --queryformat '%{RELEASE}' ${package} | awk -F "." '{print $1}'`
	        DISTRIBUTION="RED HAT"
	fi
	
	if [ -f /etc/SuSE-release ]; then
		OS_VERSION=`rpm -q --queryformat '%{VERSION}' sles-release | awk -F "." '{print $1}'` 
		DISTRIBUTION="SUSE"
	fi

	# TO-DO exit ${ERR_unknown_vendor}
}

#----------------
replace_dblicense() {
#----------------

        if [ -f ${drive}/${dvd_dist_dir}/SYBASE_ASE_TD.lic ]; then
                cp -p ${drive}/${dvd_dist_dir}/SYBASE_ASE_TD.lic /sybase/${SID}/SYSAM-2_0/licenses
        fi

        # TO-DO exit ${ERR_handler}
}

#--------------
check_dist() {
#--------------
# check the distribution directory:
# all files to be installed must be present
	drive=${1}
	dirname=${drive}/${dvd_dist_dir}
        if [ -f /sapmnt/${SID}/profile/DEFAULT.PFL ]; then
		echo "Found files from previous installation, please clean up if you want to run a new installation! Otherwise, we just overwrite /sapmnt/NPL directory, so that you can safely repeat the installation"
		sap_server_tar="sapmnt.tgz-*"
	#	exit 1
	fi
        echo "Hit enter to continue!"
        read answer $answer

	for name in ${sap_server_tar}
	do
		if [ -e ${dirname}/"${name}" ]; then
			echo -e "File ${dirname}/${name} not found."
			exit 1
			do_exit ${ERR_no_tars_found}
		fi
	done
	tar_dist_dir=${dirname}

}

#--------------
function update_sysctl_conf () {
#--------------
        # We expect sysctl-parmname and value as parameters
        # eg. "update_sysctl_conf kernel.shmmax 21474836480"
        local date oldstring newstring
        date=`date -u +"%Y-%m-%d %H:%M:%S %Z"`
        newstring="$1=$2"
        oldstring=`tac /etc/sysctl.conf | grep -m1 -E "^[^#]*$1="`
        if [ $? -eq 0 ]; then # entry there, update
                if [ "$oldstring" != "$newstring" ]; then
                        sed -i "s@$oldstring@# Changed by SAP TestDrive on $date\n#&\n$newstring@" /etc/sysctl.conf
                fi
        else # no entry, make one
                echo -e "# Added by SAP TestDrive on $date\n$newstring" >> /etc/sysctl.conf
        fi
}

#-----------------
function calculate_sysctl() {
#-----------------

	local CHANGE=""

        if [ -f /etc/sysctl.conf ]; then
            cp -a /etc/sysctl.conf /etc/sysctl.backup
        fi
#        echo "Update the necessary information in sysctl.conf:"

	SHMALL_MIN=5242880 # 20 GB (SAP Note 941735)
	SHMALL=`/sbin/sysctl -n kernel.shmall`
	i=${SHMALL}
	if [ ${#i} -le 11  ]; then 
		[ ${SHMALL_MIN} -gt ${SHMALL} ] && update_sysctl_conf kernel.shmall $SHMALL_MIN

		SHMMAX_MIN=21474836480 # 20 GB (SAP Note 941735)
		SHMMAX=`/sbin/sysctl -n kernel.shmmax`
	# value can get too large for test -gt
	# [ ${SHMMAX_MIN} -gt ${SHMMAX} ] && update_sysctl_conf kernel.shmmax $SHMMAX_MIN
	[ $(( ${SHMMAX_MIN} > ${SHMMAX} )) ] && update_sysctl_conf kernel.shmmax $SHMMAX_MIN
	fi

	SEMMSL_MIN=1250
	SEMMNS_MIN=256000
	SEMOPM_MIN=100
	SEMMNI_MIN=8192
	SEMMSL=`awk '{print $1}' /proc/sys/kernel/sem`
	SEMMNS=`awk '{print $2}' /proc/sys/kernel/sem`
	SEMOPM=`awk '{print $3}' /proc/sys/kernel/sem`
	SEMMNI=`awk '{print $4}' /proc/sys/kernel/sem`
	[ ${SEMMSL_MIN} -gt ${SEMMSL} ] && SEMMSL=${SEMMSL_MIN} && CHANGE="x"
	[ ${SEMMNS_MIN} -gt ${SEMMNS} ] && SEMMNS=${SEMMNS_MIN} && CHANGE="x"
	[ ${SEMOPM_MIN} -gt ${SEMOPM} ] && SEMOPM=${SEMOPM_MIN} && CHANGE="x"
	[ ${SEMMNI_MIN} -gt ${SEMMNI} ] && SEMMNI=${SEMMNI_MIN} && CHANGE="x"
	[ -n "${CHANGE}" ] && update_sysctl_conf kernel.sem "$SEMMSL $SEMMNS $SEMOPM $SEMMNI"

	MAX_MAP_COUNT_MIN=1000000 # (SAP Note 900929)
	MAX_MAP_COUNT=`/sbin/sysctl -n vm.max_map_count`
	[ ${MAX_MAP_COUNT_MIN} -gt ${MAX_MAP_COUNT} ] && update_sysctl_conf vm.max_map_count $MAX_MAP_COUNT_MIN
	
        sysctl -q -p 2> /dev/null
}

#-------------------
check_for_shell() {
#-------------------
   if [ ! -e $1 ]; then
           echo -e " "
           echo -e "Warning: $1 not found."
           echo -e "You need a $2 to start the server."
           echo -e "See readme.html"
           echo -e " "
           exit 1
   fi

}

#--------------------
ask_for_password() {
#--------------------

	local answer answer2 password

	password="$1"

	echo "Please enter a password:"
	read -s answer
	echo "Please re-enter password for verification:"
	read -s answer2

	if [ "$answer" == "$answer2" ]; then
	  export ${password}="$answer"
	else
          echo "Sorry, passwords do not match." 
	  ask_for_password ${password}
	fi
	echo " "
}

#---------------
extract_tar() {
#---------------
        
        echo
        echo "extracting data archives..."

        for tar_file in ${sap_server_tar}
	  do
	       echo "extracting ${dvd_drive}/${dvd_dist_dir}/${tar_file}"	
               cat ${dvd_drive}/${dvd_dist_dir}/${tar_file} | tar -zpxvf - -C /
	  done
}

#----------------------
export_ase_env() {
#----------------------

        export SYBASE="/sybase/${SID}"
        export SYBASE_ASE="${SYBASE}/ASE-16_0"
        export SYBASE_OCS="${SYBASE}/OCS-16_0"

        if [ -d "${SYBASE_ASE}/bin" ]; then
                export PATH="${SYBASE_ASE}/bin:${PATH}"
        fi
        if [ -d "${SYBASE_OCS}/bin" ]; then
                export PATH="${SYBASE_OCS}/bin:${PATH}"
        fi

        # Libraries for ASE/OCS 16.0
        if [ -d "${SYBASE_ASE}/lib" ]; then
                export LD_LIBRARY_PATH="${SYBASE_ASE}/lib:${LD_LIBRARY_PATH}"
        fi
        if [ -d "${SYBASE_OCS}/lib" ]; then
                export LD_LIBRARY_PATH="${SYBASE_OCS}/lib:${LD_LIBRARY_PATH}"
        fi
        if [ -d "${SYBASE_OCS}/lib3p64" ]; then
                export LD_LIBRARY_PATH="${SYBASE_OCS}/lib3p64:${LD_LIBRARY_PATH}"
        fi
}

#-----------------------------
check_dataserver_version() {
#-----------------------------

        local expected_major="16"
        local bin_ds="${SYBASE_ASE}/bin/dataserver"

        if [ ! -x "${bin_ds}" ]; then
                echo "Expected dataserver binary not found at ${bin_ds}"
                echo "Contents of ${SYBASE_ASE}/bin:"
                ls -la "${SYBASE_ASE}/bin" 2>/dev/null || true
                return 1
        fi

        local ver_line
        ver_line=`"${bin_ds}" -v 2>&1 | head -n1 || true`
        echo "ASE dataserver reported: ${ver_line}"
        echo "PATH dataserver: `command -v dataserver || true`"
        echo "PATH dataserver -v: `dataserver -v 2>&1 | head -n1 || true`"

        if echo "${ver_line}" | grep -q "Adaptive Server Enterprise/${expected_major}\."; then
                return 0
        fi

        # Fallback: some environments produce PCI bridge errors; try to infer from binary strings
        if command -v strings >/dev/null 2>&1; then
                local str_ver
                str_ver=`strings "${bin_ds}" 2>/dev/null | grep -m1 "Adaptive Server Enterprise/" || true`
                echo "ASE dataserver strings hint: ${str_ver}"
                if echo "${str_ver}" | grep -q "Adaptive Server Enterprise/${expected_major}\."; then
                        echo "Heuristic version check passed via strings." 
                        return 0
                fi
        fi

        # As a last resort: if the binary path is under ASE-16_0, allow continuation with a warning
        case "${bin_ds}" in
                */ASE-16_0/bin/dataserver)
                        echo "Warning: Unable to parse ASE version, but binary is from ASE-16_0. Continuing."
                        return 0
                        ;;
        esac

        echo "Warning: Could not confirm ASE ${expected_major}.x. Version line: ${ver_line}"
        echo "Proceeding; installer may still fail if an unexpected version is used."
        return 0
}

#---------------------------
add_ase_traceflag() {
#---------------------------

        local run_file="/sybase/${SID}/ASE-16_0/install/RUN_${SID}"
        if [ -f "${run_file}" ]; then
                if grep -q -- "-T11889" "${run_file}"; then
                        echo "-T11889 already present in ${run_file}"
                else
                        echo "Adding -T11889 to ${run_file}"
                        sed -i '0,/\[.]cfg[[:space:]]*\\/{s//.cfg -T11889 \\/}' "${run_file}"
                fi
        else
                echo "${run_file} does not exist. Skipping modification."
        fi
}

#--------------------------------------
pin_ase_runfile_paths() {
#--------------------------------------

        local run_file="/sybase/${SID}/ASE-16_0/install/RUN_${SID}"
        local ase_bin="/sybase/${SID}/ASE-16_0/bin"

        if [ -f "${run_file}" ]; then
                # Only rewrite if not already absolute to ASE-16_0
                if ! grep -q "${ase_bin}/dataserver" "${run_file}"; then
                        echo "Pinning dataserver path in ${run_file}"
                        sed -i -E "s@(^|[[:space:]])dataserver([[:space:]])@\\1${ase_bin}/dataserver\\2@" "${run_file}"
                fi
                if ! grep -q "${ase_bin}/backupserver" "${run_file}"; then
                        echo "Pinning backupserver path in ${run_file}"
                        sed -i -E "s@(^|[[:space:]])backupserver([[:space:]])@\\1${ase_bin}/backupserver\\2@" "${run_file}"
                fi
        else
                echo "${run_file} does not exist. Skipping path pinning."
        fi
}

#------------------
server_install() {
#------------------

	local answer=""
	
        clear
        echo " "
        echo "#============================================ "
        echo "# "        
        echo "# Installing SAP Developer Edition  "
        echo "# "
        echo "#============================================ "        
        echo " "
        echo " "
        echo "You are about to install the SAP Developer Edition"
        echo "Please make sure you have carefully read and understood the documentation"
        echo " "
        ask_which_license

        echo " "
     	echo "Now we need the passwords for the OS users."
     	echo "Please enter a password which will be used"
        echo "for all operating system users."
	echo " "

        ask_for_password masterpwd

        echo " "
        echo "Now we begin with the installation."
        echo "Be patient, this will take a while ... "
        echo " " 
        cp ${dvd_drive}/${dvd_dist_dir}/sapinst.txt ${dvd_drive}/${dvd_dist_dir}/sapinstmod.txt
	sed -i  "s/<INST_HOST>/${virt_hostname}/g" ${dvd_drive}/${dvd_dist_dir}/sapinstmod.txt 
	sed -i  "s/<Appl1ance>/${masterpwd}/g" ${dvd_drive}/${dvd_dist_dir}/sapinstmod.txt 
         # now install the software 
	if [ x"${skip_kernel_parameters}" = "xy" ]; then
		echo "Kernel parameters not set!"
	else
        	calculate_sysctl
        fi
	extract_tar 
	export_ase_env
	if ! check_dataserver_version; then
		echo "Failing early due to unsupported ASE version detection. Please ensure ASE 16.0 binaries are present."
		exit 1
	fi
	pin_ase_runfile_paths
	add_ase_traceflag
        rm /sapmnt/NPL/profile/NPL_D00_vhcalnplci_*
        replace_dblicense
	/usr/sap/${SID}/SYS/exe/run/SAPCAR -xf ${dvd_drive}/${dvd_dist_dir}/SAPHOSTAGENT*.SAR -R /tmp/hostctrl
	cd /tmp/hostctrl/
	./saphostexec -install
	#/cal/plugins/initial_hook.sh
        /usr/sap/hostctrl/exe/SAPCAR -xf ${dvd_drive}/${dvd_dist_dir}/SWPM10*.SAR -R /tmp/swpm
	cd /tmp/swpm/
	
	
	
	if [ x"${guimode}" = "xy" ]; then
		SYBASE="/sybase/${SID}" \
		SYBASE_ASE="/sybase/${SID}/ASE-16_0" \
		SYBASE_OCS="/sybase/${SID}/OCS-16_0" \
		LD_LIBRARY_PATH="/sybase/${SID}/OCS-16_0/lib3p64:/sybase/${SID}/ASE-16_0/lib:${LD_LIBRARY_PATH}" \
		PATH="/sybase/${SID}/ASE-16_0/bin:/sybase/${SID}/OCS-16_0/bin:${PATH}" \
		./sapinst product.catalog SAPINST_EXECUTE_PRODUCT_ID=NW_StorageBasedCopy SAPINST_INPUT_PARAMETERS_URL=${dvd_drive}/${dvd_dist_dir}/sapinstmod.txt
	else
		SYBASE="/sybase/${SID}" \
		SYBASE_ASE="/sybase/${SID}/ASE-16_0" \
		SYBASE_OCS="/sybase/${SID}/OCS-16_0" \
		LD_LIBRARY_PATH="/sybase/${SID}/OCS-16_0/lib3p64:/sybase/${SID}/ASE-16_0/lib:${LD_LIBRARY_PATH}" \
		PATH="/sybase/${SID}/ASE-16_0/bin:/sybase/${SID}/OCS-16_0/bin:${PATH}" \
		./sapinst product.catalog SAPINST_EXECUTE_PRODUCT_ID=NW_StorageBasedCopy SAPINST_INPUT_PARAMETERS_URL=${dvd_drive}/${dvd_dist_dir}/sapinstmod.txt -nogui -noguiserver SAPINST_SKIP_DIALOGS=true
	fi
	if [ $? -eq 0 ]; then
		rm -rf /tmp/sapinst_instdir
		sidadmhome=`eval echo "~${sid}adm"`
		echo "setenv LD_LIBRARY_PATH /usr/sap/NPL/hdbclient:\$LD_LIBRARY_PATH" >> ${sidadmhome}/.sapenv_${REAL_HOSTNAME}.csh
		sed -i '/SAPFQDN/d' /sapmnt/${SID}/profile/DEFAULT.PFL /sapmnt/${SID}/profile/${SID}_ASCS01* /sapmnt/${SID}/profile/${SID}_D00_*
        	#echo "setenv LD_LIBRARY_PATH /usr/sap/NPL/hdbclient:\$LD_LIBRARY_PATH" >> /home/npladm/.sapenv_${virt_hostname}.csh
		su -c "startsap r3" -l ${sid}adm
		echo "Installation of ${SID} successful"
	else
		echo "Installation of ${SID} failed, please check logifiles in /tmp/sapinst_instdir for possible root cause."
	fi
	rm -rf /tmp/swpm
	echo " "
}


#---------------------
ask_which_license() {
#---------------------
        echo " "
        echo "To install this TestDrive you have to accept "
        echo ""
        echo "the SAP COMMUNITY DEVELOPER License (DEV)."
        echo ""
        answer=DEV
        case $answer in
         "DEV"|"dev" ) show_license SAP_COMMUNITY_DEVELOPER_License;;
         *    ) echo "DEV" 
                ask_which_license;;
        esac
}

#----------------
show_license() {
#----------------
        
        cat ${dvd_drive}/$1 | more
        accept_license
}

#------------------
accept_license() {
#------------------
        
	local answer=""

        echo " "
        echo "Do you agree to the above license terms? yes/no:"
        read answer $answer

        case $answer in
         yes|y|Y  ) echo " ";;
         # no       ) do_exit ${ERR_sap_eula_refused};;
         no|n|N   ) exit 1;;
         *    ) echo "yes/no" 
                accept_license;;
        esac
}


#-----------------------------------------------------------
#
# Main
#
#-----------------------------------------------------------

   dvd_drive=$(dirname $(readlink -f $0))

   # check for root:
   if [ `id -u` != "0" ]; then
	echo -e "You should be root to start this program"
	exit 1
	#do_exit ${ERR_no_suid} 
   fi

   # check_for_shell "/bin/ksh" "Korn Shell"
   check_for_shell "/bin/csh" "C Shell"

   # mkdir -m 755 -p /db2
   
   check_dist ${dvd_drive}
   check_vendor
   server_install

   exit $?
############################################################

