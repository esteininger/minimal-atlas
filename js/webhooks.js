var baseURL = `https://webhooks.mongodb-realm.com/api/client/v2.0/app/atlasconfigurator-xyznk/service/Atlas/incoming_webhook`;

export const getClusters = (uid) => {
  return fetchHelper(`${baseURL}/getClusters`, uid);
};

export const createCluster = (uid, data) => {
  let url = `${baseURL}/createCluster`

  const params = {
    method: "post",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      ...(uid && { Authorization: uid })
    },
    ...(data && { body: JSON.stringify(data) })
  }

  //return fetchHelper(url, uid, data);
  return fetch(url, params)
  .then(handleErrors)
  .then(response => response.json())
  .catch(error => console.log(error) );    

};

/// Helper Functions
function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  //if (response.json().error) {
  //  throw Error(response);
  //}
  return response;
}

const fetchHelper = (url, uid, data) => {
  const params = {
    //mode: "no-cors",
    method: data ? "post" : "get",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      //'Access-Control-Allow-Origin': '*',
      ...(uid && { Authorization: uid })
    },
    ...(data && { body: JSON.stringify(data) })
  };

  return fetch(url, params)
    .then(handleErrors)
    .then(response => response.json())
    .catch(error => console.log(error) );    
};


