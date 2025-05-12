import axios from 'axios';

const serverDomain = import.meta.env.VITE_SERVER_DOMAIN_WITHOUT_API;
console.log(serverDomain);


const api = axios.create({
  baseURL: serverDomain,
  withCredentials: true, 
});

export default api;