/* Make sure we aren't called multiple times, as this would add multiple handlers. */
let importExportInited = false;

/* This function handles the details of importing from and exporting to files. While the code uses
   many concepts that you have seen already, it also uses some advanced techniques we haven't
   covered (and in some cases won't cover). You don't need to understand it to complete the
   assignment. See the assignment writeup for how to call this function. */
const setupImportExport = (importFn, exportFn) => {
  if (importExportInited) {
    throw new Error("setupImportExport called multiple times");
  }
  importExportInited = true;

  const onImport = (event) => {
    document.querySelector("#importFile").click();
  };

  const onSelectFile = (event) => {
    let file = event.currentTarget.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.addEventListener("error", (event) => {
      throw new Error("Error reading board file");
    });
    reader.addEventListener("load", (event) => {
      importFn(JSON.parse(reader.result));
    });
    reader.readAsText(file);
    event.currentTarget.value = "";
  };

  const onExport = (event) => {
    let json = JSON.stringify(exportFn(), null, 2);
    let link = document.createElement("a");
    link.style.display = "none";
    link.href = `data:application/json;charset=UTF-8,${encodeURIComponent(json)}`;
    link.download = "board.json";
    document.body.append(link);
    link.click();
    link.remove();
  };

  document.querySelector("#import").addEventListener("click", onImport);
  document.querySelector("#importFile").addEventListener("change", onSelectFile);
  document.querySelector("#export").addEventListener("click", onExport);
};
