var baseURL = `https://webhooks.mongodb-realm.com/api/client/v2.0/app/atlasconfigurator-xyznk/service/Atlas/incoming_webhook`;

export const getClusters = (uid) => {
  return fetchHelper(`${baseURL}/getClusters`, uid);
};

/// Helper Functions
const fetchHelper = (url, uid, data) => {
  const params = {
    method: data ? "post" : "get",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      ...(uid && { Authorization: uid }),
    },
    ...(data && { body: JSON.stringify(data) }),
  };

  return fetch(url, params)
    .then(handleErrors)
    .then(response => response.json())
    //.then(data => console.log(data))
    .catch(error => console.log(error) );    
};

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
