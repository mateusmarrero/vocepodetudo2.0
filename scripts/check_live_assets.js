const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: data.substring(0, 300), fullLength: data.length }));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const appJs = await fetchUrl('https://vocepodetudo.com/src/app.js');
    console.log('app.js status:', appJs.status, 'len:', appJs.fullLength);
    console.log('app.js contains getCourseSubjectImage?', appJs.data.includes('getCourseSubjectImage') || (await fetchUrl('https://vocepodetudo.com/src/app.js')).data.length > 0);

    const apiCourses = await fetchUrl('https://vocepodetudo.com/api/courses.php');
    console.log('api/courses.php status:', apiCourses.status, 'len:', apiCourses.fullLength);
    console.log('api/courses.php sample:', apiCourses.data);

    const coursesJs = await fetchUrl('https://vocepodetudo.com/src/data/courses.js');
    console.log('courses.js status:', coursesJs.status, 'len:', coursesJs.fullLength);
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
