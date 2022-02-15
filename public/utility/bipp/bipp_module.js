// const {BIPP,Bipp} = require('./bippType');



/**
 * @type {BIPP}
 */
var bipp = (function (){
  /**
   * House the configurations use to run the module
   * @type {Bipp.Config}
   */
  var configuration={
    width:150,
    measureUnit:"px",
    //height ratio in reference to the width
    height:0,
    aspectRatio:1,
    uploaderHtml:'<div style="border:gray dashed 5px;width:250px; height:150px; color:grey; padding-top:10px;cursor: pointer;"><span style="font-size:60px;font-weight: 1000;" >&plus;</span><br><span>Upload a picture to test <b>BIPP</b></span></div>',
    uploadPrompt:"Choose A Frame That suit you",
    changeFilePrompt:"if you don't find a frame that suit you, it advisable to change the picture you want to upload",
    changeButton:"Change Picture",
    uploadStatus:true,
    feedbackImg:"",
    compression:true,
    autoSelect:false
  }
  /**
   * Contain all the event callbacks registered by an app
   * @type {Bipp.EventCallBacks}
   */
  var events={
		start:[],
		beforeSelect:[],//if any callback return boolean false, image selection won't be possible
		afterSelect:[],//(original image-if present,selection status)
		beforeCompress:[],//(original image)
		afterCompress:[],//(compressed image,compression status) similar to 'frameSelect' event

		frameSelect:[],//(original/compressed image,BIPPstyle) depending on compression state
		frameHover:[],// (hover event)
		uploaderHover:[],// (hover event)
		changeButtonClick:[]//(old original/compressed image,old BIPPstyle-if a frame have been previously selected) depending on compression state
	}

  // BIPP global private variable
  /**
   * @type {Bipp.Element[]}
   */
  var groupDecodes=[];
  /**
   * @type {Bipp.Element[]}
   */
  var IDdecodes=[];
  /**
   * @type {Bipp.Element[]}
   */
  var elemDecodes=[];
  /**
   * @type {{[bippFileID:string]:Bipp.List}}
   */
  var listDecodes={};
  /**
   * @type {Bipp.Files}
   */
  var bippFiles={};
  /**
   * @type {Bipp.SessionOptions}
   */
  var sessionOptions={};
  var bippModule,
  sessionFileID="",
  sessionStyleID="",
  style={},
  styleList=["bipp-equal","bipp-width-1","bipp-width-2","bipp-height-1","bipp-height-2"],
  styleListValue=["center","left","right","top","bottom"],
  heightList=["bipp-equal","bipp-height-1","bipp-height-2"],
  heightListValue=["center","top","bottom"],
  widthList=["bipp-equal","bipp-width-1","bipp-width-2"],
  widthListValue=["center","left","right"],
  imgRatio,
  feedbackImgWidth,
  fileSelectMessage,
  low,
  high;

  // BIPP UI private variable
  var curtain,
  frame,
  framesCon,
  changeFile,
  uploadStatus,
  uploadPrompt,
  uploaderCon,
  uploader,
  canvasContext,
  input,
  image;
  /**
   * @type {HTMLCanvasElement}
   */
  var canvas;

  // BIPP private functions
  /**
   * BIPP reference for DOM Element that has been _decoded_
   * @param {string} pic image url
   * @param {string} style BIPPStyle in the format of '`bippStyle|bippCords`-`aspect ratio`'
   * @param {string|HTMLElement} port the `ID`|`groupPort`|`listID` the element is attach to, in case of decodeElement() it is equal to the reference of the decoded HTMLElement
   * @returns {Bipp.Element}
   */
  function BIPPElement(pic,style,port){
    // if user accidentally omits the new keyword, this will 
    // silently correct the problem...
    if ( !(this instanceof BIPPElement) )return new BIPPElement(pic,style,port);

    // Same as above, except that it throws an exception
    // if ( !(this instanceof arguments.callee) ) throw new Error("Constructor called as a function");

		this.pictureUrl = pic;
		this.bippStyle = style;
		this.port = port;
	}
  /**
   * BIPP reference for registered `list`
   * @param {string} style BIPPStyle in the format of '`bippStyle|bippCords`-`aspect ratio`'
   * @param {string} port the `listID`
   * @returns {Bipp.List}
   */
  function BIPPList(style,port){
    // if user accidentally omits the new keyword, this will 
    // silently correct the problem...
    if ( !(this instanceof BIPPList) )return new BIPPList(style,port);

    this.listID=port;
    this.bippStyle=style;
    this.lastDecodedIndex=-1;
    /**
     * @type {Bipp.Element[]}
     */
    this.decodes=[];
  }
  function frameProcessor(width,height,transferredUrl,low,high){
    imgRatio = width/height;
    if(imgRatio<low&&!configuration.autoSelect){
      framesCon.innerHTML = "";
      for(var i=0;i<heightList.length;i++){
        framesCon.innerHTML += '<div class="bipp-frame-house"><div class="bipp-label-con"><label><div class="bipp-frame bipp '+heightList[i]+'" style="width:'+configuration.width+configuration.measureUnit+';height:'+configuration.height+configuration.measureUnit+';" onmouseover="bipp.hover(event,\'frame\')"><div class="bipp-curtain"><img class="bipp-feedback-image" src="'+configuration.feedbackImg+'" style="width:'+feedbackImgWidth+'%;" ></div><input type="radio" onchange="bipp.checkStyle('+i+')" name="bipp-style" value="'+heightListValue[i]+'-'+configuration.aspectRatio+'"></div></label></div></div>';
      }
    } else if(imgRatio >high&&!configuration.autoSelect){
      framesCon.innerHTML = "";
      for(var i=0;i<widthList.length;i++){
        framesCon.innerHTML += '<div class="bipp-frame-house"><div class="bipp-label-con"><label><div class="bipp-frame bipp '+widthList[i]+'" style="width:'+configuration.width+configuration.measureUnit+';height:'+configuration.height+configuration.measureUnit+';" onmouseover="bipp.hover(event,\'frame\')"><div class="bipp-curtain"><img class="bipp-feedback-image" src="'+configuration.feedbackImg+'" style="width:'+feedbackImgWidth+'%" ></div><input type="radio" onchange="bipp.checkStyle('+i+')" name="bipp-style" value="'+widthListValue[i]+'-'+configuration.aspectRatio+'"></div></label></div></div>';
      }
    } else {
      framesCon.innerHTML = '<div class="bipp-frame-house"><div class="bipp-label-con"><label><div class="bipp-frame bipp bipp-equal" style="width: '+configuration.width+configuration.measureUnit+';height:'+configuration.height+configuration.measureUnit+';" onmouseover="bipp.hover(event,\'frame\')"><div class="bipp-curtain" style="display: block;"><img class="bipp-feedback-image" src="'+configuration.feedbackImg+'" style="width:'+feedbackImgWidth+'%" ></div><input type="radio" name="bipp-style" value="center'+'-'+configuration.aspectRatio+'" checked></div></label></div></div>';
      style[sessionStyleID] = 'center';
      // frameSelect EVENT TRIGGER - before image compression
      eventEmit("frameSelect")

      compressImage();
    }
    for(var i=0;i<frame.length;i++){
      frame[i].style.backgroundImage = "url("+transferredUrl+")";
    }
  }
  function inputChange(e){
    if(!sessionFileID){
      sessionFileID="default";
      sessionStyleID="default";
    }
    //Get file
    var file=bippFiles[sessionFileID] = e.target.files[0];
    uploadStatus.style.display = configuration.uploadStatus?'block':'none';
    var messageResult = ["No Picture Selected","Selected file is not a picture","Picture Selected"]

    if (file&&(file.type.indexOf("image")!=-1)) {
      // file type checking should be done to know if the uploaded file was an image or other file type
      framesCon.style.display = "block";
      image.style.display = "inline";
      image.src = URL.createObjectURL(file);
      changeFile.style.display = "block";
      uploadStatus.innerHTML = '<b style="color:#484">'+messageResult[2]+'</b>';
      fileSelectMessage = messageResult[2];
      uploadPrompt.style.display = "block";
      uploaderCon.style.display = "none";
    } else{
      framesCon.style.display = "none";
      changeFile.style.display = "none";
      uploadPrompt.style.display = "none";
      uploaderCon.style.display = "block";

      // To prevent throwing of Uncaught error if file == undefined
      try {
        if(file.type.indexOf("image")==-1){
          uploadStatus.innerHTML = '<b style="color:#f77">'+messageResult[1]+'</b><br><br>';
          fileSelectMessage = messageResult[1];
          bippFiles[sessionFileID] = undefined;
          style[sessionStyleID]=undefined
        }
      } catch (err) {
        uploadStatus.innerHTML = '<b style="color:#f77">'+messageResult[0]+'</b><br><br>';
        fileSelectMessage = messageResult[0];
      }
    }

    // afterSelect EVENT TRIGGER
    eventEmit("afterSelect")
  }
  function imageLoad(e) {
    // To get the #bipp-image width and height when image is uploaded		
  
    // the #bipp-image is hidden after the width and height has been gotten, bipp Canvas also use it to draw it image
    image.style.display = "none";
  
    //Aspect ratio ranges
    var ratio = configuration.aspectRatio;
    var AB = 1.17,BC = 1.42,CD=1.64,DE=2.06,FG=0.5,GH=0.62,HI=0.71,AI=0.88;
    var Arange = ratio >= AI && ratio < AB,Brange = ratio >= AB && ratio < BC,Crange = ratio >= BC && ratio < CD,Drange = ratio >= CD && ratio < DE,Erange = ratio >= DE,Frange = ratio < FG,Grange = ratio >= FG && ratio < GH,Hrange = ratio >= GH && ratio < HI,Irange = ratio >= HI && ratio < AI;
  
    if (Arange) {
    low = AI;
    high=AB;
    } else if (Brange) {
    low = AB;
    high=BC;
    } else if (Crange) {
    low = BC;
    high=CD;
    } else if (Drange) {
    low = CD;
    high=DE;
    } else if (Erange) {
    low = DE;
    high=Infinity;
    } else if (Frange) {
    low = 0;
    high=FG;
    } else if (Grange) {
    low = FG;
    high=GH;
    } else if (Hrange) {
    low = GH;
    high=HI;
    } else {
    low = HI;
    high=AI;
    }
    if (ratio <= 1) {
      feedbackImgWidth = 100;
    } else {
      feedbackImgWidth = 100*(1/ratio);
    }
    frameProcessor(image.width,image.height,image.src,low,high);

  }
  function compressImage(){
    // To draw image on Canvas and get a blob from the canvas, the blob file is then passed to bippFiles, but if user-agent/browser does not support HTMLCanvasElement or CanvasRenderingContext2D or HTMLElement.toBlob() method bippFiles will contain the user original inputed image -which can be significantly heavy-

    var isCanvasSupported = !!window.CanvasRenderingContext2D && !!window.HTMLCanvasElement && !!canvas.getContext && !!canvasContext;
    var isToBlobSupported = !!canvas.toBlob;
    var blobCanBeCreated = configuration.compression && isToBlobSupported && isCanvasSupported;
    if(sessionOptions.compression){
      blobCanBeCreated = sessionOptions.compression && isToBlobSupported && isCanvasSupported;
    }
  
    if(blobCanBeCreated){
      // beforeCompress EVENT TRIGGER
      eventEmit("beforeCompress")

      var BIPP_CANVAS_WIDTH = sessionOptions.width || configuration.width;
      var BIPP_CANVAS_RATIO = sessionOptions.aspectRatio || configuration.aspectRatio;
      canvas.width = BIPP_CANVAS_WIDTH;
      var BIPP_CANVAS_HEIGHT = canvas.height = BIPP_CANVAS_WIDTH/BIPP_CANVAS_RATIO;
      if(!sessionFileID){
        sessionFileID="default";
        sessionStyleID="default"
      }
      var bippStyleStyle = getStyle(sessionStyleID).split("-")[0];
  
      // use the bippstyle to draw image on Canvas
      switch(bippStyleStyle){
        case "left":
          canvasContext.drawImage(image, 0, 0,BIPP_CANVAS_HEIGHT*imgRatio,BIPP_CANVAS_HEIGHT);
          break;
        case "right":
          canvasContext.drawImage(image,-((BIPP_CANVAS_HEIGHT*imgRatio)-BIPP_CANVAS_WIDTH), 0,BIPP_CANVAS_HEIGHT*imgRatio,BIPP_CANVAS_HEIGHT);
          break;
        case "top":
          canvasContext.drawImage(image, 0, 0,BIPP_CANVAS_WIDTH,BIPP_CANVAS_WIDTH/imgRatio);
          break;
        case "bottom":
          canvasContext.drawImage(image, 0, -((BIPP_CANVAS_WIDTH/imgRatio)-BIPP_CANVAS_HEIGHT),BIPP_CANVAS_WIDTH,BIPP_CANVAS_WIDTH/imgRatio);
          break;
        case "center":
          if(imgRatio < BIPP_CANVAS_RATIO){
            canvasContext.drawImage(image, 0, -((BIPP_CANVAS_WIDTH/imgRatio)-BIPP_CANVAS_HEIGHT)/2,BIPP_CANVAS_WIDTH,BIPP_CANVAS_WIDTH/imgRatio);
          } else if(imgRatio > BIPP_CANVAS_RATIO){
            canvasContext.drawImage(image, -((BIPP_CANVAS_HEIGHT*imgRatio)-BIPP_CANVAS_WIDTH)/2,0,BIPP_CANVAS_HEIGHT*imgRatio,BIPP_CANVAS_HEIGHT);
          } else {
            canvasContext.drawImage(image,0,0,BIPP_CANVAS_WIDTH,BIPP_CANVAS_HEIGHT);
          }
          break;
        default:console.error("bippstyle is empty, BIPP compression can't be done");
          break;
      }
      canvas.toBlob(function(blob){
        // @ts-ignore
        // Gave the blob a "name", "lastModified" and "lastModifiedDate" to make it a file
        blob.name = bippFiles[sessionFileID].name.split(".")[0]+".jpg";// @ts-ignore
        blob.lastModifiedDate = new Date();// @ts-ignore
        blob.lastModified = blob.lastModifiedDate.getTime();

        // @ts-ignore 
        // Update the BIPPFile with the compressed picture
        bippFiles[sessionFileID] = blob;
        // afterCompress EVENT TRIGGER
        eventEmit("afterCompress","success")
        resetSession()
      },"image/jpeg");
      
    } else{
      if(!configuration.compression || (sessionOptions.compression!==undefined&&!sessionOptions.compression)){
        console.log("%c Compression is set to false in BIPP config or session Options, provided image won't be compressed.\n 'beforeCompress' and 'afterCompress' events won't trigger","color:blue");
        // afterCompress EVENT TRIGGER
        eventEmit("afterCompress","compression is false")
        resetSession()
      } else{
        console.error("Browser doesn't support canvas rendering or HTMLElement.toBlob() method, compressed version of inputed image can't be created. \n The uncompressed original image inputed by the user is passed to 'bipp.getFile()' instead.");
        // afterCompress EVENT TRIGGER
        eventEmit("afterCompress","browser error")
        resetSession()
      }
    }
    function resetSession() {
      sessionFileID="";
      sessionStyleID="";
      sessionOptions={};
    }
  }
  /**
   * It emit the occurrence of BIPP event
   * @param {Bipp.EventType} eventName event type
   * @param {string|Event=} eventLoad the event load
   */
   function eventEmit(eventName,eventLoad){

    switch(eventName){
      case "start":
        if(events[eventName][0]){
          for(var i=0;i<events[eventName].length;i++){
            events[eventName][i]()
          }
        }
        break;
      case "beforeSelect":
        var returns = [];
        if(events[eventName][0]){
          for(var i=0;i<events[eventName].length;i++){
            returns.push(events[eventName][i](sessionFileID))
          }
          return returns;
        }
        break;
      case "afterSelect":
        var bippFiles = getFile();
        var bippMessage = fileSelectMessage;

        if(events[eventName][0]){
          for(var i=0;i<events[eventName].length;i++){// @ts-ignore
            events[eventName][i](bippFiles,sessionFileID,bippMessage)
          }
        }
        break;
      case "beforeCompress":
        var bippFiles = getFile();
        if(events[eventName][0]){
          for(var i=0;i<events[eventName].length;i++){// @ts-ignore
            events[eventName][i](bippFiles,sessionFileID)
          }
        }
        break;
      case "afterCompress":
        var bippFiles = getFile();

        if(events[eventName][0]){
          for(var i=0;i<events[eventName].length;i++){// @ts-ignore
            events[eventName][i](bippFiles,sessionFileID,eventLoad)
          }
        }
        break;
      case "frameSelect":
        var bippFiles = getFile();
        var bippStyles = getStyle()
        if(events[eventName][0]){
          for(var i=0;i<events[eventName].length;i++){// @ts-ignore
            events[eventName][i](bippFiles,bippStyles)
          }
        }
        break;
      case "frameHover":
        if(events[eventName][0]){
          for(var i=0;i<events[eventName].length;i++){// @ts-ignore
            events[eventName][i](eventLoad)
          }
        }
        break;
      case "uploaderHover":
        if(events[eventName][0]){
          for(var i=0;i<events[eventName].length;i++){// @ts-ignore
            events[eventName][i](eventLoad)
          }
        }
        break;
      case "changeButtonClick":
        var bippFiles = getFile();
        var bippStyles = getStyle()

        if(events[eventName][0]){
          for(var i=0;i<events[eventName].length;i++){// @ts-ignore
            events[eventName][i](bippFiles,bippStyles)
          }
        }
        break;
      default:console.error("no such eventName ---->"+eventName);
    }

  }
  /**
   * Use to pass BIPPStyle and url to a BIPPElement
   * @param {string} url image url
   * @param {HTMLElement|Element} elem element to be decoded
   * @param {string} style BIPPStyle in the format of '`bippStyle|bippCords`-`aspect ratio`'
   * @param {string=} indexInList the `list index` of the element, used when element is part of a list
   */
  function renderElement(elem,style,url,indexInList){
    // Check if Element is a bipp-element, if it is just update it bippStyle
    var currentBippStyle = style.split("-");
    var styleValue = currentBippStyle[0];
    var styleRatio = currentBippStyle[1];

    // @ts-ignore
    elem.style.backgroundImage = "url("+url+")";// @ts-ignore
    elem.style.height = elem.scrollWidth/+styleRatio+configuration.measureUnit;

    if(elem.className.indexOf("bipp-element")===-1){
			for(var i=0;i<styleListValue.length;i++){
				if(styleValue == styleListValue[i]){
					elem.className += " "+styleList[i]+" bipp-element"+(indexInList?(" "+indexInList):'');
					break;
				}
			}
		}else{
			// Below code enable the replacement of BIPPstyle of a BIPP element that previously have a BIPPstyle
      elem.className = elem.className.replace(styleListValue[0],styleValue).replace(styleListValue[1],styleValue).replace(styleListValue[2],styleValue).replace(styleListValue[3],styleValue).replace(styleListValue[4],styleValue);
		}
  }
  /**
   * It update the BIPPStyle of a list, sanitize decodes of a list and re-render the list BIPPElement
   * @param {string} style BIPPStyle in the format of '`bippStyle|bippCords`-`aspect ratio`'
   * @param {string} port the `listID`
   */
  function updateList(style,port){
    listDecodes[port].bippStyle=style;
    refreshList(port)
  }
  /**
   * Sanitize decodes of a list
   * 
   * This prevent the re-rendering of a dead BIPPElement
   * @param {string} port the `listID`
   */
  function sanitizeList(port){
    /**
     * @type {Bipp.Element[]}
     */
    var listDecoded=listDecodes[port].decodes;
    for(var i=0,len=listDecoded.length;i<len;i++){
      var elem = document.querySelector('.'+port+'.'+listDecoded[i].port);
      // If BIPPElement doesn't exist, delete it from list decodes
      if(!elem){
        listDecoded.splice(i,1);
        // When a dead BIPPElement is removed, the lenght of `listDecoded` changes and the index of elements after the deleted element changes( 1 less than their previous index)
        i--;// `i` is decremented to re-adjust the index of elements after the deleted element
        // Since lenght of `listDecoded` change after deletion of a dead BIPPElement `len` have to be updated with the new length
        len=listDecoded.length;
      }
    }
  }
  /**
   * Use to determine the index of an object in the `array` that the value of the provided `property`
   * is equal to the `searchTerm`
   * @param {BIPPElement[]} array The object array to be searched
   * @param {string} property The object property to be searched
   * @param {string|HTMLElement} searchTerm The value to be looked for
   * @returns {number} The index of the object in the `array`.
   */
  function indexOfObject(array, property, searchTerm){
    for(var i=0,len=array.length;i<len;i++){
      if(array[i][property]===searchTerm)return i;
    }
    return -1;
  }
  function isStyleCorrect(style){
    var currentBippStyle = style.split("-");
    var styleValue = currentBippStyle[0];
    var styleRatio = currentBippStyle[1];

    var bippCorrect=false;
    for(var i=0,len=styleListValue.length;i<len;i++){
      if(styleListValue[i]==styleValue){
        bippCorrect=true;break;
      }
    }
    if(bippCorrect)return true;
    else {
      console.log("Invalid BIPPStyle");
      return false
    }
  }
  function createVirtualModule(){
    var virtualModule=document.createElement('div');
    virtualModule.id='bipp-module';
    virtualModule.style.display='none';
    return virtualModule;
  }
  function clearListerners(){
    input.removeEventListener('focusin',focusIn);
		input.removeEventListener('focusout',focusOut);
		input.removeEventListener('change', inputChange);
		image.removeEventListener('load', imageLoad);

  }
  function addListerners(){
    // Listen for when keyboard focus on bipp-input, for User Accessibility
		input.addEventListener('focusin',focusIn);
		input.addEventListener('focusout',focusOut);
		input.addEventListener('change', inputChange);
		image.addEventListener('load', imageLoad);
  }
  function focusIn(){
    uploader.style.outline = "solid";
  }
  function focusOut(){
    uploader.style.outline = "none";
  }

  // BIPP UI public function
  function changeImage(){
    // changeButtonClick EVENT TRIGGER
    eventEmit("changeButtonClick")

    style.default = "";
    input.click();
  }
  function hover(e,eventType){
    switch (eventType) {
      case "frame":
        // frameHover EVENT TRIGGER
        eventEmit("frameHover",e)
        break;
      case "uploader":
        // uploaderHover EVENT TRIGGER
        eventEmit("uploaderHover",e)
        break;
      default:
        break;
    }
  }
  function checkStyle(position){
    for(var i=0;i<curtain.length;i++){
      curtain[i].style.display = "none";
    }
    style[sessionStyleID] = bippModule.querySelectorAll("[name='bipp-style']")[position].value;
    curtain[position].style.display = "block";
    // frameSelect EVENT TRIGGER - before image compression
    eventEmit("frameSelect")

    compressImage();
  }




  // BIPP public functions
  function startBipp(config,target){
		if(config.width)configuration.width = parseInt(config.width);
		if(config.measureUnit)configuration.measureUnit = config.measureUnit;
		if(config.aspectRatio)configuration.aspectRatio = parseInt(config.aspectRatio);
		if(config.uploaderHtml)configuration.uploaderHtml = config.uploaderHtml;
		if(config.uploadPrompt)configuration.uploadPrompt = config.uploadPrompt;
		if(config.changeFilePrompt)configuration.changeFilePrompt = config.changeFilePrompt;
		if(config.changeButton)configuration.changeButton = config.changeButton;
		if(config.uploadStatus!=undefined)configuration.uploadStatus = !!config.uploadStatus;
		if(config.feedbackImg)configuration.feedbackImg = config.feedbackImg;
		if(config.compression!=undefined)configuration.compression=config.compression;
    if(config.autoSelect!=undefined)configuration.autoSelect = config.autoSelect;
		configuration.height=configuration.width/configuration.aspectRatio;

    // Check if module as been initiated before, if so clear it
    if(bippModule){
      bippModule.innerHTML='';
    }

    if(target&&!document.getElementById(target)){
      // If user provide `target`, there must be an HTMLElement with ID ===`target` else return error
      return console.error("BIPP could not initialize, HTMLElement with the id of '"+target+"' does not exist in DOM");
    }

    // If user provide `target`, the HTMLElement reference is stored to `bippModule` else a virtual HTMLElement is created and stored to `bippModule`
    bippModule=(target&&document.getElementById(target))||createVirtualModule();
		bippModule.innerHTML = '<div class="bipp-uploader-con"><label><div class="bipp-uploader" onmouseover="bipp.hover(event,\'uploader\')">'+configuration.uploaderHtml+'</div><input class="bipp-input" type="file" accept="image/*" tabindex="0"></label></div><!-- A mock tag that is used to get the width and height of uploaded image --><img class="bipp-image"><div class="bipp-upload-status"></div><div class="bipp-upload-prompt">'+configuration.uploadPrompt+'</div><div class="bipp-frames-container"><input type="radio" name="bipp-style" value="" style="width:20px;height:20px" checked></div><div class="bipp-change-file"><div class="bipp-change-file-prompt">'+configuration.changeFilePrompt+'</div><canvas class="bipp-canvas" width="'+configuration.width+'" height="'+configuration.height+'" style="display:none"></canvas><button class="bipp-change-button" onclick="bipp.changeImage()">'+configuration.changeButton+'</button></div>';

    curtain = bippModule.getElementsByClassName("bipp-curtain"),
    frame = bippModule.getElementsByClassName("bipp-frame"),
    framesCon = bippModule.getElementsByClassName("bipp-frames-container")[0],
    changeFile =bippModule.getElementsByClassName("bipp-change-file")[0],
    uploadStatus = bippModule.getElementsByClassName("bipp-upload-status")[0],
    uploadPrompt = bippModule.getElementsByClassName("bipp-upload-prompt")[0],
    uploaderCon = bippModule.getElementsByClassName("bipp-uploader-con")[0],
    uploader = bippModule.getElementsByClassName("bipp-uploader")[0],
    // @ts-ignore
    canvas = bippModule.getElementsByClassName("bipp-canvas")[0],
    input = bippModule.getElementsByClassName("bipp-input")[0],
    image = bippModule.getElementsByClassName("bipp-image")[0];

    // Event listeners are cleared to prevent the adding of more listeners
    //   when bipp.start is called multiple times
    clearListerners();

    addListerners();
		canvasContext = canvas.getContext("2d");

		// START EVENT TRIGGERS
		eventEmit("start")
	}
  /**
   * Use to decode/update decoded HTMLElement
   * @param {HTMLElement} elem 
   * @param {string} pictureUrl 
   * @param {string} bippStyle 
   */
  function decodeElement(elem,pictureUrl,bippStyle){
    if(!elem|| elem instanceof Element) return console.error("HTMLElement not provided or does not exist");
    if(!isStyleCorrect(bippStyle)) return console.error("Invalid BIPPStyle cannot be passed to HTMLElement)");

    var portPresence=indexOfObject(elemDecodes,'port',elem);
    if(portPresence===-1)elemDecodes.push(new BIPPElement(pictureUrl,bippStyle,elem));
    else {
      elemDecodes[portPresence].bippStyle=bippStyle;
      elemDecodes[portPresence].pictureUrl=pictureUrl;
    }
    renderElement(elem,bippStyle,pictureUrl)

  }
  function decodeID(pictureUrl,bippStyle,IDPort){
    if(!isStyleCorrect(bippStyle)) return console.error("Invalid BIPPStyle cannot be passed to "+IDPort+"(ID of HTMLElement)");
    var elem = document.getElementById(IDPort);
    if(!elem) return console.error("HTMLElement with ID of "+IDPort+" does not exist");

    var portPresence=indexOfObject(IDdecodes,'port',IDPort);
    if(portPresence===-1)IDdecodes.push(new BIPPElement(pictureUrl,bippStyle,IDPort));
    else {
      IDdecodes[portPresence].bippStyle=bippStyle;
      IDdecodes[portPresence].pictureUrl=pictureUrl;
    }
    renderElement(elem,bippStyle,pictureUrl)
	}
  /**
   * Use to decode/update decoded HTMLElements having a particular classname with same image url and BIPP Style
   * @param {string} pictureUrl image url
   * @param {string} bippStyle BIPPStyle in the format of '`bippStyle|bippCords`-`aspect ratio`'
   * @param {string} groupPort the classname to be decoded
   */
  function decodeGroup(pictureUrl,bippStyle,groupPort){
    if(!pictureUrl){
			return console.error("An argument in bipp.decodeGroup() is either null or missing\nno picture to render");
		}
		if(!bippStyle){
			return console.error("An argument in bipp.decodeGroup() is either null or missing\nno bippStyle to render");
		}
		if(!groupPort){
			return console.error("An argument in bipp.decodeGroup() is either null or missing\nno groupPort to render");
		}
    if(!isStyleCorrect(bippStyle))return console.error("Invalid BIPPStyle cannot be passed to "+groupPort+"(classname of HTMLElements)");
    

    // Check if classname has been decoded before
    var portPresence = indexOfObject(groupDecodes,'port',groupPort);
    if(portPresence===-1){
      groupDecodes.push(new BIPPElement(pictureUrl,bippStyle,groupPort))
    } else{
        groupDecodes[portPresence].pictureUrl=pictureUrl;
        groupDecodes[portPresence].bippStyle=bippStyle;
    }
    refreshGroup(groupPort)
  }
  /**
   * Use to Register/Update a `listID`
   * @param {string} bippStyle BIPPStyle in the format of '`bippStyle|bippCords`-`aspect ratio`'
   * @param {string} listID the `listID`
   * @param {string[]|string} pictureUrl image url(s)
   */
  function registerList(bippStyle,listID,pictureUrl){
    if(!isStyleCorrect(bippStyle))return console.error("Invalid BIPPStyle cannot be passed to "+listID+"(listID)");

    // If listID has been registered before, re-render all BIPPElement in the list and update the list object if the new bippStyle !== previously uploaded bippStyle
    if(!listDecodes[listID]) listDecodes[listID] = new BIPPList(bippStyle,listID);
    else if(bippStyle!==listDecodes[listID].bippStyle) updateList(bippStyle,listID);
    
    // if initial url(s) is/are provided, decode them
    if(pictureUrl)decodeList(pictureUrl,listID);
  }
  /**
   * 
   * @param {string|string[]} pictureUrl image url(s)
   * @param {string} listID the `listID`
   */
  function decodeList(pictureUrl,listID){
    /**
     * Store the index of the next element to be decoded 
     * if `pictureUrl === Array of url` to be decoded
     * 
     * It is use to avoid re-checking `element === 'bipp-element'`
     * on element that has been checked before
     */
    var nextDecodeIndex=0;
    var listElem=document.getElementsByClassName(listID),
    elemsLenght=listElem.length;

    // check if url(s) to be decode is singular(a string) or multiple(an array)
    if(Array.isArray(pictureUrl)){
      // multiple url(s) to be decoded
      for(var i=0,len=pictureUrl.length;i<len;i++){
        if(nextDecodeIndex>=elemsLenght) break;
        decoder(pictureUrl[i])
      }
    } else {
      // typeof `pictureUrl`=== 'string'. single url to be decoded
      decoder(pictureUrl)
    }

    /**
     * 
     * @param {string} url
     */
    function decoder(url){
      // i === nextDecodedIndex just to handle decoding if `pictureUrl === Array of url` to be decoded
      for(var i=nextDecodeIndex;i<elemsLenght;i++){
        if(listElem[i].className.indexOf('bipp-element')===-1){
          var elemIndexInList="bipp"+(++listDecodes[listID].lastDecodedIndex);
          renderElement(listElem[i],listDecodes[listID].bippStyle,url,elemIndexInList);
          listDecodes[listID].decodes.push(new BIPPElement(url,listDecodes[listID].bippStyle,elemIndexInList));
          nextDecodeIndex=++i;
          return
        }
        if(i===(elemsLenght-1)){
          nextDecodeIndex=elemsLenght;
        }
      }
    }
  }

  /**
   * 
   * @param {HTMLElement} elem 
   * @returns 
   */
  function refreshElement(elem){
    // if `elem` === undefined, refresh all HTMLElement decoded with decodeElement()
    if(!elem){}

    if(!(elem instanceof Element)) return console.error("HTMLElement does not exist, so it can't be refreshed");

		var index = indexOfObject(elemDecodes,'port',elem);

    if(index===-1) return console.error(new Error("The HTMLElement to be refreshed have not been decoded"));

    var style = elemDecodes[index].bippStyle.split("-");
    elem.style.height = elem.scrollWidth/+style[1]+configuration.measureUnit;

  }
  function refreshID(IDPort){
    // if IDPort === undefined, refresh all IDports
    if(!IDPort){
      for(var i=0,len=IDdecodes.length;i<len;i++){// @ts-ignore
        var elem = document.getElementById(IDdecodes[i].port);
        if(!elem){
          console.log("HTMLElement with ID of "+IDdecodes[i].port+" does not exist, so it can't be refreshed");
          continue
        }
  
        var style = IDdecodes[i].bippStyle.split("-");
        elem.style.height = elem.scrollWidth/+style[1]+configuration.measureUnit;
      }
      return
    }

		var index = indexOfObject(IDdecodes,'port',IDPort);

    if(index===-1) return console.error(new Error("The IDPort to be refreshed have not been decoded"));
    
    var elem = document.getElementById(IDPort);
    if(!elem) return console.error("HTMLElement with ID of "+IDPort+" does not exist, so it can't be refreshed");

    var style = IDdecodes[index].bippStyle.split("-");
    elem.style.height = elem.scrollWidth/+style[1]+configuration.measureUnit;
	}
  function refreshGroup(groupPort){
    // if groupPort === undefined, refresh all groupPort
    if(!groupPort){
      for(var i=0,len=groupDecodes.length;i<len;i++){// @ts-ignore
        var elems = document.getElementsByClassName(groupDecodes[i].port);
        if(!elems){
          console.log("HTMLElement(s) with classname of "+groupDecodes[i].port+" does not exist, so nothing can be refreshed");
          continue
        }
        
        // decode Element with the classname of `groupPort`
        for(var x=0,xlen=elems.length;x<xlen;x++){
          renderElement(elems[x],groupDecodes[i].bippStyle,groupDecodes[i].pictureUrl)
        }
      }
      return
    }
    var portPresence = indexOfObject(groupDecodes,'port',groupPort);
    if(portPresence===-1) return console.error(new Error("The groupPort to be refreshed have not been decoded"));

    var elems = document.getElementsByClassName(groupPort);
    if(!elems) return console.error("HTMLElement(s) with classname of "+groupPort+" does not exist, so nothing can be refreshed");

    // Get group BIPP decode
    var decode = groupDecodes[portPresence];

    // decode Element with the classname of `groupPort`
    for(var i=0,len=elems.length;i<len;i++){
      renderElement(elems[i],decode.bippStyle,decode.pictureUrl)
    }
  }
  function refreshList(listID){
    if(!listID){
      for(var list in listDecodes){
        sanitizeList(list);
        /**
         * @type {Bipp.Element[]}
         */
        var listDecoded = listDecodes[list].decodes;
        for(var i=0,len=listDecoded.length;i<len;i++){
          var elem = document.querySelector('.'+list+'.'+listDecoded[i].port);
          renderElement(elem,listDecodes[list].bippStyle,listDecoded[i].pictureUrl)
        }
      }
      return
    }
    sanitizeList(listID);
    /**
     * @type {Bipp.Element[]}
     */
    var listDecoded = listDecodes[listID].decodes;
    for(var i=0,len=listDecoded.length;i<len;i++){
      var elem = document.querySelector('.'+listID+'.'+listDecoded[i].port);
      renderElement(elem,listDecodes[listID].bippStyle,listDecoded[i].pictureUrl)
    }
  }
	function refreshAll(){
		// To Re-render IDPorts, groupPorts and listIDs
		refreshID()
    refreshGroup()
    refreshList()
	}



	function getFile(bippFileID){
		if(bippFileID&& typeof bippFileID=="string")return bippFiles[bippFileID];
		return bippFiles;
	}
	function getStyle(bippStyleID){
		if(bippStyleID&& typeof bippStyleID=="string")return style[bippStyleID];
		return style;
	}
	function selectPicture(bippFileID,options){
		if(!bippFileID || typeof bippFileID!="string"){
			return console.error('please provide a bippFileID for picture seclection');
			// emit an error event that let user know the error type
		}
		// beforeSelect EVENT TRIGGER
		var eventReturns = eventEmit("beforeSelect") || [];
		for(var i=0;i<eventReturns.length;i++){
			if(eventReturns[i]==false){
				// if any item in eventReturns is equal to boolean false
				// 	stop the loop and exit the function before clicking bipp-input
				return
				// emit an error event that let user know the error type
			}
		}
		// if all items in eventReturns is equal to boolean true or undefined
		// 	bipp-input should be clicked for image selection
		sessionFileID=bippFileID;
		sessionStyleID=bippFileID;
		if(options && typeof options == 'object'){
			sessionOptions = options;
		}

		// Clearing previously selected file
		input.value="";

		// if value is still `true` after above clearing, fallback for older browser is attempted
		if(input.value){
			input.value.type='text';
			input.value.type=='file';
		}

		input.click();
	}
	function resetFile(bippFileID){
		bippFiles[bippFileID] = undefined;
		style[bippFileID] = undefined;
	}
	//return(boolean,message)
	function canCompress(){
		var isCanvasSupported = !!window.CanvasRenderingContext2D && !!window.HTMLCanvasElement && !!canvas.getContext && !!canvasContext;
		var isToBlobSupported = !!canvas.toBlob;
		var browserCanCompress = isToBlobSupported && isCanvasSupported;

    return browserCanCompress;
	}
	function on(eventName,callback){
		switch(eventName){
			case "start":
				events.start.push(callback)
				break;
			case "beforeSelect":
				events.beforeSelect.push(callback)
				break;
			case "afterSelect":
				events.afterSelect.push(callback)
				break;
			case "beforeCompress":
				events.beforeCompress.push(callback)
				break;
			case "afterCompress":
				events.afterCompress.push(callback)
				break;
			case "frameSelect":
				events.frameSelect.push(callback)
				break;
			case "frameHover":
				events.frameHover.push(callback)
				break;
			case "uploaderHover":
				events.uploaderHover.push(callback)
				break;
			case "changeButtonClick":
				events.changeButtonClick.push(callback)
				break;
			default: console.trace(eventName+" is not an eventName");
				console.error(eventName+" is not an eventName")
		}
	}


  window.addEventListener('resize',function(){
    refreshAll();
  });

  return {
    start:startBipp,

    decodeElement:decodeElement,
    decodeID:decodeID,
    decodeGroup:decodeGroup,
    registerList:registerList,
    decodeList:decodeList,

    refreshElement:refreshElement,
    refreshID:refreshID,
    refreshGroup:refreshGroup,
    refreshList:refreshList,
    refreshAll:refreshAll,

    getFile:getFile,
    getStyle:getStyle,
    selectPicture:selectPicture,
    resetFile:resetFile,
    canCompress:canCompress,
    on:on,

    changeImage:changeImage,
    hover:hover,
    checkStyle:checkStyle
  }
})();

// TODO
//    - BIPP undecoding function
//    - BIPP encoding upgrade. bippCord and 'compressed'
//    - BIPP auto-select(center select), fastSelect(3 options) and 
//      cropEnabling(crop plug-in integration)
//    - BIPP error event integration
//    - Polyfill for Array.prototype.indexOf, URL.createObjectURL
//    - BIPP for server

