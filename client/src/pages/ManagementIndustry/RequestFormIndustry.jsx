import RequestFormList from "../../components/RequestFormList";
import APIEndPoints from "../../middleware/ApiEndPoints";

const RequestFormIndustry = () => {
  const getRequestFormsAPI = APIEndPoints.get_all_request_forms.url;
  const deleteRequestFormAPI = APIEndPoints.delete_request_form.url;

  return (
    <RequestFormList
      apiEndpoint={getRequestFormsAPI}
      deleteEndpoint={deleteRequestFormAPI}
    />
  );
};

export default RequestFormIndustry;