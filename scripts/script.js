function saveReportDocumentIDAndRedirect(){
    let params = new URL(window.location.href) //get the url from the search bar
    let ID = params.searchParams.get("docID");
    localStorage.setItem('reportDocID', ID);
    window.location.href = "report.html";
}