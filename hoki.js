const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

// ====================== Load Account ======================
const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const lines = [];
    const fileStream = readline.createInterface({
      input: fs.createReadStream(filePath),
      output: process.stdout, 
      terminal: false 
    });

    fileStream.on('line', (line) => {
      lines.push(line.trim());
    });

    fileStream.on('close', () => resolve(lines));
    fileStream.on('error', (err) => reject(err));
  });
};

// ====================== Ask a question in the console ======================
const askQuestion = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};


// ====================== Mining status ======================
const getStatusMining = async (authKey) => { 
  const url = 'https://notpx.app/api/v1/mining/status';
  const headers = {
    Authorization: 'initData ' + authKey, 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0'
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data.userBalance;
  } catch (error) {
    console.error('Error getting mining status:', error.message);
    return null;
  }
};

// ====================== Clear tasks ======================
const clearTask = async (authKey, taskUrl) => { 
  let successfulClears = 0; 

  const headers = {
    Authorization: 'initData ' + authKey,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0'
  };

  const requests = Array.from({ length: 500 }, () => axios.get(taskUrl, { headers }));

  try {
    const responses = await Promise.all(requests); 

    responses.forEach(response => {
      if (response.data[Object.keys(response.data)[0]] === true) {
        successfulClears++;
      }
    });
  } catch (error) {
   
  }

  return successfulClears;
};

// ====================== Run mining task ======================
const runMiningTasks = async () => {
    const taskUrls = [
      'https://notpx.app/api/v1/mining/task/check/x?name=notpixel',
      'https://notpx.app/api/v1/mining/task/check/x?name=notcoin',
      'https://notpx.app/api/v1/mining/task/check/channel?name=notcoin',
      'https://notpx.app/api/v1/mining/task/check/channel?name=notpixel_channel',
      'https://notpx.app/api/v1/mining/task/check/joinSquad',
      'https://notpx.app/api/v1/mining/task/check/premium',
      'https://notpx.app/api/v1/mining/task/check/leagueBonusGold',
      'https://notpx.app/api/v1/mining/task/check/leagueBonusSilver'
    ];
  
    try {
      const hashKeys = await readFile('./hash.txt');
      console.log('\nVIP ADFMIDN - Not Pixel Kehokian\n');
  
      while (true) {
        for (const [index, hashKey] of hashKeys.entries()) {
          console.log(`[ ! ]  Login Akun ke-${index + 1}`);
          let balance = await getStatusMining(hashKey);
          if (balance !== null) {
            console.log(`      + Balance : ${balance}`); 
            for (const taskUrl of taskUrls) {
              const taskName = taskUrl.split('/').pop().split('?')[0]; 
              const clearedCount = await clearTask(hashKey, taskUrl); 
              if (clearedCount > 0) {
                console.log(`      + Task ${taskName} berhasil sebanyak ${clearedCount}`); 
              } else {
                console.log(`      - Task ${taskName} Gagal`);
              }
            } 
  
            balance = await getStatusMining(hashKey);
            if (balance !== null) {
              console.log(`      + Now Balance : ${balance}`);
            }
          } else {
            console.log(`      - Gagal mengambil balance. Lewati akun ini.`); 
          }
        }
  
        console.log("Waiting for 1 seconds before the next loop...\n");
        await new Promise(resolve => setTimeout(resolve, 1 * 1000)); // 1 seconds
      } 
    } catch (error) {
      console.error('An error occurred during mining:', error); 
    }
  };
  
  runMiningTasks(); 