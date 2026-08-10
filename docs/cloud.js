let sheetsAPIkey = 'AIzaSyAyIofSJYruGN_d83MjGkDU3KhLp23jBAY';

const uid = function(){
        return Date.now().toString(36) + Math.random().toString(36).slice(2,5);
        // milliseconds encoded in base 36 and then a random string (slice(2,5) to get rid of the '0.')
    }

fetch('http://localhost:8000/private.key')
  .then(response => response.text())
  .then((data) => {
    //console.log(data);
    sheetsAPIkey = data; 
    getList();
  })
  .catch(error => {
    console.error('Fetch failed:', error);
    getList();
  });



const workbookID = '13ApODkHcHU0TTMHAAgqz8HAmvdN7NKeAYJSPOyRjSOI';
const sheetID = '981474759';

function getList() {
    let sheet = "MainList";
    fetch('https://sheets.googleapis.com/v4/spreadsheets/'+workbookID+'/values/'+sheet+'!B1:B?key='+sheetsAPIkey)
        .then(response => response.text())
        .then((data) => {
            console.log(data);
            //TODO save this list somewhere to view uploaded projects
        });
}

function getLayersWhileUploadingImages() {
    let new_layers = [];
    let project_name = document.getElementById('project_name').value;
    new_layers.push({"name":project_name, "bg":background_color});
    reorderListData();
    populateList();
    //console.log(JSON.stringify(layers));
    for(let i=0; i<numLayers; i++) {
      let layer = new Layer;
      if (layers[i].getLayerSetting("enabled") == "true"){
        Object.assign(layer,layers[i]);
        if (layer.getType() == 'image'){
            let imageID = uploadImage(layer.getImageData());
            layer.setImageData(imageID);
        } else {
            layer.setImageData("")
        }
        new_layers.push(layer);
      }
    }
    return new_layers;
}

function uploadLayout(){
    console.log('uploading');
    const formKey = '1FAIpQLSeZbMJrXacx0B17woFNmXeYH9mMvUfJIZhvihT9vmEt_xwp2Q';
    const identE = '780599992';
    const layersE = '1015359788';
    const screenE = '1015839762'
    const metaE = '1109142805';

    
    let project_name = document.getElementById('project_name').value;
    
    let id = encodeURIComponent(uid());
    let metadata = encodeURIComponent(project_name);
    let screenshot = getCompressedCanvasDataURI(preview, 10000);

    let layers = LZString.compressToEncodedURIComponent(JSON.stringify(getLayersWhileUploadingImages()));

    let formResponse = `https://docs.google.com/forms/d/e/${formKey}/formResponse?entry.${identE}=${id}&entry.${layersE}=${layers}&entry.${screenE}=${screenshot}&entry.${metaE}=${metadata}`;
    try {
        fetch(formResponse, {
            method: "POST"
            });
    } catch(err) {
        //console.log(err);
    }
    //uploadImages(id);
}

function splitStringArray(str, chunkSize) {
  if (chunkSize <= 0) return [];
 
  const numChunks = Math.ceil(str.length / chunkSize);
  return Array.from({ length: numChunks }, (_, i) => 
    str.slice(i * chunkSize, (i + 1) * chunkSize)
  );
}

function uploadImage(data){
    const formKey = '1FAIpQLSc6_iso3eW9bnEh3l3h53AbjqTLUpquQ1ORbqNwtCj35W6BgQ';
    const identE = '2026018919';
    const indexE = '232507166';
    const dataE = '695953714';
    
    const id = uid();
    let chunkedData = splitStringArray(data, 10000);

    for (let i = 0; i<chunkedData.length; i++){
        let index = i.toString();
        let data = encodeURIComponent(chunkedData[i]);
        let formResponse = `https://docs.google.com/forms/d/e/${formKey}/formResponse?entry.${identE}=${id}&entry.${indexE}=${index}&entry.${dataE}=${data}`;
        console.log(id, index);
        try {
            fetch(formResponse, {
                method: "POST"
                });
        } catch(err) {
            //console.log(err);
        }
    }
    return id;
}

function getCompressedCanvasDataURI(canvas, targetBytes) {
  // Binary search for the right quality
  let lo = 0.05, hi = 0.8, best = null;
  let mid = (lo + hi) / 2;

  while (hi - lo > 0.02) {
    const blob = encodeURIComponent(canvas.toDataURL('image/jpeg', mid));
    mid = (lo + hi) / 2;
    if (blob.length <= targetBytes) {
      best = blob;
      lo = mid;  // Try higher quality
    } else {
      hi = mid;  // Need lower quality
    }
  }
  console.log(mid, decodeURIComponent(best));
  return best;
}

