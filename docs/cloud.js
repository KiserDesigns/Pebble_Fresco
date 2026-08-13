const k1 = 'AIzaSyAyI';
const k2 = 'ofSJYruGN_';
const k3 = 'd83MjGkDU3';
const k4 = 'KhLp23jBAY';

let sheetsAPIkey = k1 + k2 + k3 + k4;

const uid = function(){
        return Date.now().toString(36) + Math.random().toString(36).slice(2,5);
        // milliseconds encoded in base 36 and then a random string (slice(2,5) to get rid of the '0.')
    }

fetch('http://localhost:8000/private.key')
  .then(response => response.text())
  .then((data) => {
    //console.log(data);
    sheetsAPIkey = data; 
  })
  .catch(error => {
    console.error('Fetch failed:', error);
  });



const workbookID = '13ApODkHcHU0TTMHAAgqz8HAmvdN7NKeAYJSPOyRjSOI';

async function getList() {
    let sheet = "MainList";
    return await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+workbookID+'/values/'+sheet+'!B2:D?key='+sheetsAPIkey)
        .then(response => response.text())
        .then((data) => {
            //console.log(data);
            return data;
            //TODO save this list somewhere to view uploaded projects
        });
}

async function getLayersWhileUploadingImages() {
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
            let imageID = await uploadImage(layer.getImageData());
            layer.setImageData(imageID);
        } else {
            layer.setImageData("")
        }
        new_layers.push(layer);
      }
    }
    return new_layers;
}

async function uploadLayout(){
    console.log('uploading');
    document.getElementById('submit_publish').disabled = true;


    const screenFormKey = '1FAIpQLSeZbMJrXacx0B17woFNmXeYH9mMvUfJIZhvihT9vmEt_xwp2Q';
    const identE = '780599992';
    //const layersE = '1015359788';
    const screenE = '1015839762'
    const metaE = '1109142805';

    let id = encodeURIComponent(uid());
    
    let screenshot = getCompressedCanvasDataURI(preview, 6000);

    let metadata = encodeURIComponent(JSON.stringify({
        'name': document.getElementById('publish_name').value,
        'author': document.getElementById('publish_author').value,
        'description': document.getElementById('publish_description').value,
        'platform': platform
    }));

    let screenResponse = `https://docs.google.com/forms/d/e/${screenFormKey}/formResponse?entry.${identE}=${id}&entry.${screenE}=${screenshot}&entry.${metaE}=${metadata}`;
    try {
        await fetchForm(screenResponse);
    } catch(err) {
        //console.log(err);
    }  
    
    
    const layerFormKey = '1FAIpQLSdt6ZxARwCOoAglISWbIkOQcGJ7PUrHZ2wGdf4PBbH7VN_A0w'
    const identFormE = '812687514';
    const layersE = '1521661986';

    let layers = LZString.compressToEncodedURIComponent(JSON.stringify(await getLayersWhileUploadingImages()));

    let layerResponse = `https://docs.google.com/forms/d/e/${layerFormKey}/formResponse?entry.${identFormE}=${id}&entry.${layersE}=${layers}`;
    try {
        await fetchForm(layerResponse);
    } catch(err) {
        //console.log(err);
    }

    document.getElementById('submit_publish').disabled = false;
    document.getElementById('publish-overlay').style.display = 'none';
}

async function fetchForm(url){
    try {
        const response = await fetch(url, {method: "POST"});
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response;
        //console.log(data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function splitStringArray(str, chunkSize) {
  if (chunkSize <= 0) return [];
 
  const numChunks = Math.ceil(str.length / chunkSize);
  return Array.from({ length: numChunks }, (_, i) => 
    str.slice(i * chunkSize, (i + 1) * chunkSize)
  );
}

async function uploadImage(data){
    const formKey = '1FAIpQLSc6_iso3eW9bnEh3l3h53AbjqTLUpquQ1ORbqNwtCj35W6BgQ';
    const identE = '2026018919';
    const indexE = '232507166';
    const dataE = '695953714';
    
    const id = uid();
    let chunkedData = splitStringArray(data, 6000);

    for (let i = 0; i<chunkedData.length; i++){
        let index = i.toString();
        let data = encodeURIComponent(chunkedData[i]);
        let formResponse = `https://docs.google.com/forms/d/e/${formKey}/formResponse?entry.${identE}=${id}&entry.${indexE}=${index}&entry.${dataE}=${data}`;
        console.log(id, index);
        try {
            await fetchForm(formResponse);
        } catch(err) {
            //console.log(err);
        }
    }
    return id;
}

function getCompressedCanvasDataURI(canvas, targetBytes) {
  // Binary search for the right quality
  drawLayers(fast);
  let lo = 0.05, hi = 0.95, best = encodeURIComponent(canvas.toDataURL('image/jpeg', 0.01));
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
  console.log(mid, best.length);
  return best
}

function showPublish() {
    document.getElementById('publish-overlay').style.display = "block";
    const publish_canvas = document.getElementById('publish-canvas');

    publish_canvas.width = plat_w;
    publish_canvas.height = plat_h;
    publish_canvas.style.width = plat_w + "px";
    publish_canvas.style.height = plat_h + "px";


    publish_canvas.src = decodeURIComponent(getCompressedCanvasDataURI(preview, 8000));
    if (plat_w == plat_h){
        publish_canvas.style.borderRadius='50%';
    } else {
        publish_canvas.style.borderRadius='0%';
    }
    document.getElementById('publish_name').value = document.getElementById('project_name').value;
}


document.getElementById('browse_button').addEventListener("click",function(){
    //debugger;
    showBrowse();
});

async function showBrowse() {
    document.getElementById('browse-overlay').style.display = "block";
    let browseArea = document.getElementById('browse-area');
    
    browseArea.innerHTML = '<div class="flex center grow">Downloading Published Frescos...</div>';
    let list = JSON.parse(await getList()).values;
    browseArea.innerHTML = '';
    let platform_special = (platform == 'chalk') || (platform == 'emery') || (platform == 'gabbro');
    for(let i = 0; i<list.length; i++){
        //console.log(list[i]);
        let meta = JSON.parse(list[i][2]);
        let is_special = (meta['platform'] == 'chalk') || (meta['platform'] == 'emery') || (meta['platform'] == 'gabbro');
        if((!platform_special && !is_special) || (meta['platform'] == platform)){
            let le = document.createElement('div');
            le.classList.add("browse-list")
            le.style.height = '140px';
            le.innerHTML = `<div style="margin-right:1vh;min-width:120px;max-width:120px;" class="flex center"><img height=100% src=${list[i][1]}></img></div>
            <div class="flex column grow">
                <div class="flex">
                    <div class="grow flex column">
                        <div style="font-size:20px;">${meta['name']}</div>
                        <div class="pad">by: ${meta['author']}</div>
                    </div>
                    <div>
                        <button onclick="loadOnline('${list[i][0]}');this.disabled=true;">Load</button>
                    </div>
                </div>
                <div style="overflow:hidden;font-family:gotham-light;">${meta['description']}</div>
            </div>`;
            browseArea.appendChild(le);
        }
    }
}

async function loadOnline(ident){
    let sheet = "LayerData";
    let identList = await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+workbookID+'/values/'+sheet+'!B2:B?key='+sheetsAPIkey)
        .then(response => response.text())
        .then((data) => {
            //console.log(data);
            return data;
            //TODO save this list somewhere to view uploaded projects
        });

    let imageSheet = "ImageData";
    let imageList = await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+workbookID+'/values/'+imageSheet+'!B2:B?key='+sheetsAPIkey)
        .then(response => response.text())
        .then((data) => {
            //console.log(data);
            return JSON.parse(data).values;
            //TODO save this list somewhere to view uploaded projects
        });

    async function loadOnlineImage(image, layer){
        let imgdata = [];
        let min_i = 999999;
        let max_i = -1;
        for (let i = 0; i < imageList.length; i++){
            if (imageList[i][0] == image){
                if (i<min_i){
                    min_i = i;
                }
                if (i>max_i){
                    max_i = i;
                }
            }
        }
        let fetchData = await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+workbookID+'/values/'+imageSheet+'!B'+(min_i+2).toString()+':D'+(max_i+2).toString()+'?key='+sheetsAPIkey)
            .then(response => response.text())
            .then((data) => {
                //console.log(JSON.parse(data).values)
                return JSON.parse(data).values;
            }
        );
        console.log(layer, image);
        for (let i = 0; i < fetchData.length; i++){
            if (fetchData[i][0] == image){
                console.log(fetchData[i][1]);
                imgdata[parseInt(fetchData[i][1])] = fetchData[i][2];
            }
        }
        let dataURI = ""
        for (let i = 0; i<imgdata.length; i++){
            dataURI = dataURI + imgdata[i];
        }
        layers[layer].setImageData(dataURI);
    }

    //debugger;
    identList = JSON.parse(identList).values;
    for (let i = 0; i < identList.length; i++){
        if (identList[i][0] == ident){
            await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+workbookID+'/values/'+sheet+'!C'+(i+2).toString()+'?key='+sheetsAPIkey)
                .then(response => response.text())
                .then((data) => {
                    //console.log(data);
                    let content = LZString.decompressFromEncodedURIComponent(JSON.parse(data).values[0][0]);
                    //console.log(content);

                    let parseObject = JSON.parse(content);
                    document.getElementById('project_name').value = parseObject[0]["name"];
                    background_color = parseObject[0]["bg"];
                    pickr.setColor(background_color);
                    for( let i=1; i<Math.min(numLayers+1,parseObject.length); i++){
                        Object.assign(layers[i-1], parseObject[i]);
                        if (layers[i-1].getType()=='image'){
                            loadOnlineImage(layers[i-1].getImageData(), i-1);
                        }
                    }
                    for(i=parseObject.length-1;i<numLayers;i++){
                        layers[i].setLayerSetting("enabled", "false");
                    }
                    document.getElementById('browse-overlay').style.display = "none";
                    populateList();
                    drawLayers(fast);
                    //TODO save this list somewhere to view uploaded projects
                }
            );
        }
    }
    //console.log(identList);
}

async function uploadTempData(data){
    
    let urls = [];
    let chunkedData = splitStringArray(data, 6000);

    for (let i = 0; i<chunkedData.length; i++){
        let index = i.toString();
        let key = 'fresco'+uid();
        let data = {};
        data[index] = encodeURIComponent(chunkedData[i]);
        let upload = await fetch('https://kv.valkeyrie.com/'+key, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
        });
        //console.log(upload);
        urls.push('https://kv.valkeyrie.com/'+key);
    }
    return urls;

}