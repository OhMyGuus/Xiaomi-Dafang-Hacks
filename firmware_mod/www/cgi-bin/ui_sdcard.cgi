#!/bin/sh
source ./func.cgi
source /system/sdcard/scripts/common_functions.sh


echo "Content-type: text"
echo "Pragma: no-cache"
echo "Cache-Control: max-age=0, no-store, no-cache"
echo ""

if [ -n "$F_cmd" ]; then
    case "$F_cmd" in
        events)
            echo "["
            find /system/sdcard/DCIM/${F_dir}/ -type f | xargs --no-run-if-empty ls -h --full-time \
            | awk '{sub(/\/system\/sdcard\/DCIM/, "viewer"); printf "{\"name\" : \"%s\",\"file\" : \"%s\", \"date\" : \"%s %s\", \"size\" : \"%s\"},",$9, $9, $6, $7, $5 f}' \
            | head -c -1
            echo "]"
        ;;
        check_sdcard)
            mount|grep "/system/sdcard"|grep "rw,">/dev/null
            if [ $? == 1 ]; then
                echo -n "nok"
            else
                echo -n "ok"
            fi
        ;;
        sdcardInfo)
            echo "sdcardSize#:#$(df -h /system/sdcard | awk 'NR==2{print$4}')"
            echo "sdcardUsed#:#$(df -h /system/sdcard | awk 'NR==2{print$3}')"
            echo "sdcardUsedPercent#:#$(df -h /system/sdcard | awk 'NR==2{print$5}')"
        ;;
        del_file)
            F_file=$(echo ${F_file} | sed -e 's/%2F/\//g' | sed -e 's/viewer/system\/sdcard\/DCIM/')
            echo "Remove ${F_file}"
            rm $F_file
        ;;
        *)
            echo "Unsupported command '$F_cmd'"
        ;;
        
    esac
fi