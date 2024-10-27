import ntpClient from 'ntp-client';
import moment from 'moment-timezone';

export let cachedTime:Date;

const getCurrentTime = (): Promise<Date>=>{
    return new Promise((resolve, reject) => {
      ntpClient.getNetworkTime("pool.ntp.org", 123, (err, date) => {
        if (err) {
          console.error("NTP 서버에서 시간을 가져오는 데 실패했습니다.", err);
          reject(err);  // 에러 발생 시 Promise를 reject
          return;
        }
        
        const seoulDate = new Date(moment(date)
                .tz("Asia/Seoul")
                .set({ second: 0, millisecond: 0 })
                .valueOf() + (9 * 60 * 60 * 1000));

        resolve(seoulDate); 
      });
    });
}

async function updateCachedTime() {
    try {
        const currentTime = await getCurrentTime();
        cachedTime = currentTime;
        console.log(cachedTime);
    } catch (error) {
        console.error(error);
    }
}

export function startTimeUpdate(refreshInterval: number) {
    updateCachedTime(); // Initial call

    setInterval(() => {
        updateCachedTime();
    }, refreshInterval);
}