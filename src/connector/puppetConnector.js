
const uniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const API_ENDPOINT = "https://habprc9pj4.execute-api.us-east-1.amazonaws.com/tests";

const saveTestSuite = async (suite) => {
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    
    // every testSuite gets a suiteID
    body: JSON.stringify({ ...suite, suiteID: suite.suiteID || uniqueId() }),
  };
  const response = await fetch(API_ENDPOINT, requestOptions);
  return await response.json();
};

const deleteTestSuite = async (id) => {
  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  };
  const response = await fetch(`${API_ENDPOINT}/${id}`, requestOptions);
  return await response.json();
};

const getTestSuite = async (id) => {
  const response = await fetch(`${API_ENDPOINT}/${id}`);
  return await response.json();
};

const getTestSuites = async () => {
  const response = await fetch(API_ENDPOINT);
  return await response.json();
};

export { saveTestSuite, deleteTestSuite, getTestSuite, getTestSuites };