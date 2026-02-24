#!/usr/bin/env bash
set -euo pipefail

SID="${SID:-NPL}"                  # change via env: SID=HA1 ./clean.sh
SIDLOW="$(echo "$SID" | tr '[:upper:]' '[:lower:]')"

[[ $EUID -eq 0 ]] || { echo "Run as root."; exit 1; }

# Safety: ensure SID looks like a 3-char alnum triplet before destructive removes
[[ -n "$SID" && "$SID" =~ ^[A-Z0-9]{3}$ ]] || { echo "Bad SID: '$SID'"; exit 1; }

echo ">>> Stopping SAP/ASE services"
systemctl stop saphostexec 2>/dev/null || true
systemctl disable saphostexec 2>/dev/null || true
pkill -f sapstartsrv 2>/dev/null || true
pkill -f sapcontrol  2>/dev/null || true
# Kill ASE (Sybase) daemons if they ever started
pkill -f "(dataserver|backupserver|sybmon|dbspawn|sqlsrvr|isql)" 2>/dev/null || true

echo ">>> Unmounting /sapmnt/$SID if mounted"
mountpoint -q "/sapmnt/$SID" && umount -lf "/sapmnt/$SID" || true

echo ">>> Removing sapinst temp/work dirs"
rm -rf /tmp/sapinst_instdir /tmp/sapinst_exe.* 2>/dev/null || true

echo ">>> Removing SAP Host Agent to stop auto-recreating sapadm"
# this is what creates sapadm if host agent is running
rm -rf /usr/sap/hostctrl /usr/sap/saphostexec /var/lib/sapadm 2>/dev/null || true

echo ">>> Removing SID-specific trees"
rm -rf "/usr/sap/$SID" "/sapmnt/$SID" "/sybase/$SID" /sybase/*${SID}* 2>/dev/null || true

echo ">>> Removing common SAP files"
rm -rf /usr/sap/sapservices 2>/dev/null || true
rm -rf /var/spool/mail/sapadm /home/sapadm 2>/dev/null || true
rm -rf "/home/${SIDLOW}adm" 2>/dev/null || true
rm -rf /var/adm/sap /var/adm/sapinst 2>/dev/null || true

echo ">>> Deleting users & groups (ignore errors)"
# stop processes owned by these users first
pkill -u "${SIDLOW}adm" 2>/dev/null || true
pkill -u sapadm 2>/dev/null || true
pkill -u syb"${SIDLOW}" 2>/dev/null || true

userdel -r "syb${SIDLOW}"  2>/dev/null || true   # e.g. sybnpl
userdel -r sapadm          2>/dev/null || true
userdel -r "${SIDLOW}adm"  2>/dev/null || true    # e.g. npladm

groupdel dba    2>/dev/null || true
groupdel sapsys 2>/dev/null || true

echo ">>> Recreate clean base dirs"
mkdir -p /usr/sap /sapmnt /sybase
chown root:root /usr/sap /sapmnt /sybase
chmod 755 /usr/sap /sapmnt /sybase

echo ">>> Remove stale IPC shared memory/semaphores (ASE sometimes leaves these)"
# Remove only SAP/ASE IPC (owned by npladm/sapadm/sybnpl)
for t in m s; do
  ipcs -$t | awk -v sidlow="$SIDLOW" 'NR>3 && ($3==(sidlow "adm") || $3=="sapadm" || $3==("syb" sidlow)) {print $2}' \
    | xargs -r -n1 ipcrm -$t
done


rm -rf /tmp/sapinst_instdir /tmp/sapinst_exe.* /tmp/swpm
rm -f /tmp/.sapinst*


echo ">>> Ensure C shell is in place for next run"
ln -sf /usr/bin/tcsh /bin/csh

echo ">>> Done. Current state:"
getent passwd sapadm || echo "sapadm: OK (absent)"
getent passwd "${SIDLOW}adm" || echo "${SIDLOW}adm: OK (absent)"
getent passwd "syb${SIDLOW}" || echo "syb${SIDLOW}: OK (absent)"
