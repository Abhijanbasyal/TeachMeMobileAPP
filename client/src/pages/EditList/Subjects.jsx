import SubjectList from '../../components/SubjectList';
import APIEndPoints from '../../middleware/ApiEndPoints';

const Subjects = () => {
  const getSubjectsAPI = APIEndPoints.get_subjects.url;
  const deleteSubjectAPI = APIEndPoints.delete_subject.url;
  const downloadVideoAPI = APIEndPoints.download_video.url;
  const downloadPDFAPI = APIEndPoints.download_pdf.url;

  return (
    <SubjectList 
      apiEndpoint={getSubjectsAPI} 
      deleteEndpoint={deleteSubjectAPI} 
      downloadVideoEndpoint={downloadVideoAPI}
      downloadPDFEndpoint={downloadPDFAPI}
    />
  );
};

export default Subjects;
