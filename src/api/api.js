import axios from 'axios'
// axios 配置
axios.defaults.timeout = config.TIMEOUT;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.baseURL = '';
// const baseurl = 'http://result.eolinker.com/wTGsdEJ4170e9cb44499d99378a2adf2621dc706bee9c6f?uri='
const baseurl = ''
const baseurlMock = ''
// axios.defaults.withCredentials = true;

 export function post(url, params) {
    return new Promise((resolve, reject) => {
        axios.post(baseurl + url, params)
            .then(response => {
                if (response.data.code!='501') {

                    resolve(response.data);
                } else if(response.data.code=='501') {
                    axios.get(baseurlMock + url, params)
                        .then(response => {
                            resolve(response.data);
                        })
                        .catch((error) => {
                            reject(error)
                        })
                }

            })
            .catch((error) => {
                axios.get(baseurlMock + url, params)
                    .then(response => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
    })
}
export function get(url, params) {
    return new Promise((resolve, reject) => {
        axios.get(baseurl + url, params)
            .then(response => {
                if (response.data.code!="501") {
                    resolve(response.data);
                } else if(response.data.code=='501') {
                    axios.get(baseurlMock + url, params)
                        .then(response => {
                            resolve(response.data);
                        })
                        .catch((error) => {
                            reject(error)
                        })
                }

            })
            .catch((error) => {
                axios.get(baseurlMock + url, params)
                    .then(response => {
                        resolve(response.data);
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
    })
}
