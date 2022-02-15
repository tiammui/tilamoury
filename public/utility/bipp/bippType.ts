// (?<=(interface bippType\{\n))((?<=[a-z A-z]*:)[a-zA-Z]*(?<!=,))(?<!=(\n\}))
// (?<=[a-z A-z]*:)[a-zA-Z]*(?<!=,)
type bippMeasureUnit='px';
type eventType='start'|'beforeSelect'|'afterSelect'|'beforeCompress'|'afterCompress'|'frameSelect'|'frameHover'|'uploaderHover'|'changeButtonClick';
type fileSelectMessage="No Picture Selected"|"Selected file is not a picture"|"Picture Selected";
type fileCompressMessage="success"|"compression is false"|"browser error";
/**
 * The unique identifier for a `BIPPFile`, it is defined at picture selection
 * when `bipp.selectFile('aBippFileID')` is called
 */
type BIPPFileID='default'|string;
/**
 * The definition/encoding of how a `BIPPFile` should be rendered in the format of '`bippCords`-`aspect ratio`'
 */
type BIPPStyle=string;
/**
 * Picture file that has been encoded by BIPP module
 */
type BIPPFile=File;
/**
 * Contain the encoding of all the newly encoded `BIPPFile`(s)
 */
type BIPPStyles={[bippFileID: string]: BIPPStyle};
/**
 * Contain all the newly encoded `BIPPFile`(s)
 */
type BIPPFiles= {[bippFileID: string]: BIPPFile};
/**
 * HTMLElement that has been rendered by BIPP module
 */
type BIPPElement=HTMLElement|Element;

/**
 * Callback for BIPP `start` eventType
 */
const startEventCallBack = ():void=>{};
type startEventCallBack = typeof startEventCallBack;
/**
 * Callback for BIPP `beforeSelect` eventType
 * @param trigger the `bippFileID` that trigger the event, can be used to know which BIPPFile is getting/been encoded
 * 
 * if any `beforeSelect` callback return `false`, image selection won't be possible
 * 
 * can be useful if you want user to fufill some conditions before selecting a picture
 */
const beforeSelectEventCallBack = (trigger:BIPPFileID):boolean|void=>{};
type beforeSelectEventCallBack = typeof beforeSelectEventCallBack;
/**
 * Callback for BIPP `afterSelect` eventType
 * 
 * @param encodedFiles object containing `BIPPFile`(s) that can be accessed with their various `bippFileID`
 * @param trigger the `bippFileID` that trigger the event, can be used to know which BIPPFile is getting/been encoded
 * @param message it pass the picture selection status
 */
const afterSelectEventCallBack = (encodedFiles:BIPPFiles,trigger:BIPPFileID,message:fileSelectMessage):void=>{};
type afterSelectEventCallBack = typeof afterSelectEventCallBack;
/**
 * Callback for BIPP `beforeCompress` eventType
 * 
 * @param encodedFiles object containing `BIPPFile`(s) that can be accessed with their various `bippFileID`
 * @param trigger the `bippFileID` that trigger the event, can be used to know which BIPPFile is getting/been encoded
 */
const beforeCompressEventCallBack = (encodedFiles:BIPPFiles,trigger:BIPPFileID):void=>{};
type beforeCompressEventCallBack = typeof beforeCompressEventCallBack;
/**
 * Callback for BIPP `afterCompress` eventType
 * 
 * @param encodedFiles object containing `BIPPFile`(s) that can be accessed with their various `bippFileID`
 * @param trigger the `bippFileID` that trigger the event, can be used to know which BIPPFile is getting/been encoded
 * @param message it pass the picture compression status
 */
const afterCompressEventCallBack = (encodedFiles:BIPPFiles,trigger:BIPPFileID,message:fileCompressMessage):void=>{};
type afterCompressEventCallBack = typeof afterCompressEventCallBack;
/**
 * Callback for BIPP `frameSelect`|`changeButtonClick` eventType
 * 
 * @param encodedFiles object containing `BIPPFile`(s) that can be accessed with their various `bippFileID`
 * @param bippStyles object containing encodings of `BIPPFile`s that can be accessed with their various `bippFileID`
 */
const clickEventCallBack = (encodedFiles:BIPPFiles,bippStyles:BIPPStyles):void=>{};
type clickEventCallBack = typeof clickEventCallBack;
/**
 * Callback for BIPP `frameHover`|`uploaderHover` eventType
 */
const hoverEventCallBack = (event:MouseEvent):void=>{};
type hoverEventCallBack = typeof hoverEventCallBack;
/**
 * Callback for BIPP event
 */
type eventCallBack= startEventCallBack|beforeSelectEventCallBack|afterSelectEventCallBack|beforeCompressEventCallBack|afterCompressEventCallBack|clickEventCallBack|hoverEventCallBack;


/**
 * Configuration object that determine the behaviour of BIPP
 */
interface BIPPConfiguration{
  /**
   * The default width pictures should be compressed to(if compression is allowed)
   * 
   * The default is `150`
   * 
   * NOTE: also determine the width of BIPP frames
   */
  width?:number,
  /**
   * The unit of measurement for the whole BIPP module
   * 
   * for now only `'px'`(pixel) is allowed
   */
  measureUnit?:bippMeasureUnit,
  /**
   * The intended aspect ratio of pictures to be selected.
   * 
   * if compression is allowed, the picture would be trimmed to the intended aspect ratio.
   * 
   * it is pass as part of BIPP style of selected picture.
   * 
   * default value is `1`
   */
  aspectRatio?:number,
  /**
   * Used to customize how you want the picture uploader UI to look like,
   *  it works exactly like assigning innerHTML to any HTML tag, caution must be taken
   *  when assigning value to this property, especially the usage of double-quotes, 
   * single-quote, backticks and some other symbols, it adviseable the developer
   *  have a working knowledge of how to assign value to innerHTML of element 
   * before editing this property
   */
  uploaderHtml?:string,
  /**
   * use to customize what prompt the user to choose a frame after a picture has been
   *  uploaded into the module. work like assigning innerHTML value to an element.
   * 
   * It default value is `"Choose A Frame That suit you"`
   * 
   * NOTE;- it totally different from uploadStatus property because it only appear when
   *  a picture is selected.
   */
  uploadPrompt?:string,
  /**
   * Use to customize what prompt the user to select another picture if user doesn't like
   *  how the presently uploaded picture in the module is displayed in frames, work
   *  like assigning innerHTML value to an element.
   * 
   * default value is `"if you don't find a frame that suit you, it advisable to change the picture you want to upload"`
   */
  changeFilePrompt?:string,
  /**
   * Use to customize the content of the button that change picture when user doesn't
   *  like how the presently uploaded picture in the module is displayed in frames,
   *  works like assigning innerHTML value to an element.
   * 
   * The default text is `'Change Picture'`
   */
  changeButton?:string,
  /**
   * Determine if a status message should show after a picture selection is attempted
   * 
   * default value is `true`
   * 
   * Useful in letting user know when a picture has been selected or not
   */
  uploadStatus?:boolean,
  /**
   * The relative/absolute path of the image that shows up when a BIPP frame is selected
   */
  feedbackImg?:string,
  /**
   * Determine if selected pictures should compress.
   * 
   * default value is `true`
   * 
   * <b>NOTE:</b> pictures will not still compress if user browser doesn't support
   * CanvasRenderingContext2D, HTMLCanvasElement and HTMLCanvasElement.toBlob()
   */
  compression?:boolean,
  /**
   * Determine if BIPP frame should be auomatically selected on upload
   * 
   * default value is `false`
   * 
   * Useful when collecting user profile picture, cause it is assumed that most people have their 
   * image in at the center of the picture.
   * 
   * This also save the user the stress of choosing a frame
   */
  autoSelect?:boolean
}
/**
 * Configuration of the picture selection session
 */
interface sessionOptions{
  /**
   * Determine if selected pictures should compress.
   * 
   * It default is equal to value of bippConfiguration.compression
   * 
   * <b>NOTE:</b> pictures will not still compress if user browser doesn't support
   * CanvasRenderingContext2D, HTMLCanvasElement and HTMLCanvasElement.toBlob()
   */
  compression?:boolean,
  /**
   * The width pictures should be compressed to(if compression is allowed)
   * 
   * It default is equal to value of bippConfiguration.width
   * 
   * NOTE: also determine the width of BIPP frames
   */
  width?:number,
  /**
   * The intended aspect ratio of pictures to be selected.
   * 
   * if compression is allowed, the picture would be trimmed to the intended aspect ratio.
   * 
   * it is pass as part of BIPP style of selected picture.
   * 
   * default value is equal to value of bippConfiguration.aspectRatio
   */
  aspectRatio?:number
}

/**
 * The BIPP module
 */
interface BIPP{
  /**
   * BIPP module initialiser
   * @param config BIPP module configuration object 
   * @param target id of element you want to house the BIPP module User Interface
   */
  start(config?:BIPPConfiguration,target?:string):void,
  /**
   * Use to decode/update decoded HTMLElement
   * @param elem the HTMLElement to be decoded
   * @param pictureUrl The url of picture
   * @param bippStyle BIPPStyle in the format of '`bippStyle|bippCords`-`aspect ratio`'
   */
  decodeElement(elem:HTMLElement,pictureUrl:string,bippStyle:string,):void,
  /**
   * Use to decode/update decoded HTMLElements with id == `IDport`
   * @param pictureUrl The url of picture
   * @param bippStyle BIPPStyle in the format of '`bippStyle|bippCords`-`aspect ratio`'
   * @param IDPort the id to be decoded
   */
  decodeID(pictureUrl:string,bippStyle:string,IDPort:string):void,
  /**
   * Use to decode/update decoded HTMLElements having a particular classname with same
   *  picture url and BIPP Style
   * @param pictureUrl The url of picture
   * @param bippStyle BIPPStyle in the format of '`bippStyle|bippCords`-`aspect ratio`'
   * @param groupPort the classname of elements to be decoded
   */
  decodeGroup(pictureUrl:string,bippStyle:string,groupPort:string):void,
  /**
   * Use to Register/Update a `listID`
   * @param bippStyle BIPPStyle in the format of '`bippStyle|bippCords`-`aspect ratio`'
   * @param listID the `listID`
   * @param pictureUrl image url(s)
   */
  registerList(bippStyle:string,listID:string,pictureUrl?:string|string[]):void,
  /**
   * Use to decode undecoded HTMLElements in a list
   * @param pictureUrl image url(s)
   * @param listID the `listID`
   */
  decodeList(pictureUrl:string|string[],listID:string):void,
  /**
   * Use to re-render HTMLElement decoded with {@link BIPP.decodeElement}.
   * 
   * It re-render all `BIPPElement`(s) decoded with HTMLElement if `elem` is not provided
   * @param elem the HTMLElement to be re-rendered
   */
  refreshElement(elem?:HTMLElement):void,
  /**
   * Use to re-render `BIPPElement` with id of `IDPort`.
   * 
   * It re-render all `BIPPElement`(s) decoded with an id if `IDPort` is not provided
   * @param IDPort the id of `BIPPElement` to be re-rendered
   */
  refreshID(IDPort?:string):void,
  /**
   * Use to re-render `BIPPElement`(s) with classname of `groupPort`.
   * 
   * Any undecode HTMLElement with classname of `gorupPort` is decoded
   * 
   * It re-render all `BIPPElement`(s) decoded as a group if `groupPort` is not provided
   * @param groupPort the classname of `BIPPElement` to be re-rendered
   */
  refreshGroup(groupPort?:string):void,
  /**
   * Use to re-render `BIPPElement`(s) that are part of a list.
   * 
   * It re-render all `BIPPElement`(s) decoded as part of a list if `listID` is not provided
   * @param listID the classname of `BIPPElement` to be re-rendered
   */
  refreshList(listID?:string):void,
  /**
   * use to re-render all `BIPPElement`(s) in an app
   * 
   * NOTE: this may have performance implications
   */
  refreshAll():void,

  /**
   * Gets a BIPPFile
   * 
   * if _`bippFileID`_ is not provided, the whole `BIPPFiles` object is returned
   * @param bippFileID The unique identifier for a `BIPPFile`
   * @returns The `BIPPFile` or object containing all `BIPPFile`(s) (the `BIPPFiles` object)
   */
  getFile(bippFileID:BIPPFileID):BIPPFile|BIPPFiles,
  /**
   * Gets the `BIPPStyle`(encoding) of a `BIPPFile`
   * 
   * if _`bippFileID`_ is not provided, the whole `BIPPStyles` object is returned
   * @param bippFileID The unique identifier for a `BIPPFile`, use to identify it encoding(also known as `BIPPStyle`)
   * @returns The `BIPPFile` encoding or object containing all `BIPPFile`(s) encoding (the `BIPPStyles` object)
   */
  getStyle(bippFileID:BIPPFileID):BIPPStyle|BIPPStyles,
  /**
   * Initialise the picture selection for a `BIPPFile` with _`bippFileID`_ as the identifier
   * @param bippFileID What should be the unique identifier for the `BIPPFile` that's to be selected and encoded
   * @param options Configuration of the picture selection session
   */
  selectPicture(bippFileID:BIPPFileID,options?:sessionOptions):void,
  /**
   * Remove `BIPPFile` and it encoding from `BIPPFiles` and `BIPPStyles`
   * @param bippFileID The unique identifier for a `BIPPFile`
   */
  resetFile(bippFileID:BIPPFileID):void,
  /**
   * Check if user browser support compression
   * @returns `true` if user browser support CanvasRenderingContext2D, HTMLCanvasElement and HTMLCanvasElement.toBlob() needed for compression, otherwise 'false'
   */
  canCompress():boolean,

  /**
   * Handle BIPP events
   * @param eventName The type of BIPP event
   * @param callback function to be called when BIPP event occurs
   */
  on(eventName:eventType,callback:eventCallBack):void,
  on(eventName:'start',callback:startEventCallBack):void,
  /**
   * @example
   * ```javascript
   * bipp.on('beforeSelect',function(trigger){
   *  switch(trigger){
   *    case 'aBippFileID':
   *      // trigger can be used to identify the BIPPFile that's about to change, can be useful if you want user to fufill some conditions before selecting a picture
   *      if(userHaveFufillPriorConditions()){
   *        console.log(`${trigger} is about to be selected`)
   *        return true;
   *      } else {
   *        alert('Fufill all prior conditions before selecting picture')
   *        return false;
   *      }
   *    case 'anotherBippFileID':
   *      console.log(`${trigger} is about to be selected`)
   *    default:
   *      // Does nothing :)
   *  }
   * });
   * ```
   */
  on(eventName:'beforeSelect',callback:beforeSelectEventCallBack):void,
  /**
   * @example
   * ```javascript
   * bipp.on('afterSelect',function(encodedFiles,trigger,message){
   *  switch(message){
   *    case 'No Picture Selected':
   *      // handle error here
   *      return console.error(message);
   *    case 'Selected file is not a picture':
   *      // handle error here
   *      return console.error(message);
   *    default:// message will be equal to "Picture Selected" here
   *      console.log(message)
   *  }
   *  switch(trigger){
   *    case 'aBippFileID':
   *      // The BIPPFile identified with the trigger can be used here
   *      encodedFiles[trigger]
   *      anImageTagRef.src = URL.createObjectURL(encodedFiles[trigger])
   *    case 'anotherBippFileID':
   *      encodedFiles[trigger]
   *    default:
   *      // Does nothing :)
   *  }
   * });
   * ```
   */
  on(eventName:'afterSelect',callback:afterSelectEventCallBack):void,
  /**
   * @example
   * ```javascript
   * bipp.on('beforeCompress',function(encodedFiles,trigger){
   *  switch(trigger){
   *    case 'aBippFileID':
   *      // The BIPPFile identified with the trigger can be used here
   *      encodedFiles[trigger]
   *      anImageTagRef.src = URL.createObjectURL(encodedFiles[trigger])
   *    case 'anotherBippFileID':
   *      encodedFiles[trigger]
   *    default:
   *      // Does nothing :)
   *  }
   * });
   * ```
   */
  on(eventName:'beforeCompress',callback:beforeCompressEventCallBack):void,
  /**
   * @example
   * ```javascript
   * bipp.on('afterCompress',function(encodedFiles,trigger,message){
   *  switch(message){
   *    case 'compression is false':
   *      // handle error here
   *      return console.error(message);
   *    case 'browser error':
   *      // handle error here
   *      return console.error(message);
   *    default:// message will be equal to "success" here
   *      console.log(message)
   *  }
   *  switch(trigger){
   *    case 'aBippFileID':
   *      // The BIPPFile identified with the trigger can be used here
   *      encodedFiles[trigger]
   *      anImageTagRef.src = URL.createObjectURL(encodedFiles[trigger])
   *    case 'anotherBippFileID':
   *      encodedFiles[trigger]
   *    default:
   *      // Does nothing :)
   *  }
   * });
   * ```
   */
  on(eventName:'afterCompress',callback:afterCompressEventCallBack):void,
  on(eventName:'frameSelect'|'changeButtonClick',callback:clickEventCallBack):void,
  on(eventName:'frameHover'|'uploaderHover',callback:hoverEventCallBack):void,

  changeImage():void,
  hover():void,
  checkStyle():void
}

/**
 * BIPP module development type
 * 
 * Do not use in integration of BIPP module to your app,
 *  it use for development of the module only
 */
namespace Bipp{
  export interface Element{
    port:string|HTMLElement,
    bippStyle:string,
    pictureUrl:string
  }
  export interface List{
    listID:string,
    bippStyle:string,
    lastDecodedIndex:number,
    decodes:Element[]
  }
  export interface Config extends BIPPConfiguration{
    height:number,
  }
  export type EventType=eventType;
  export type File = BIPPFile;
  export type Files = BIPPFiles;
  export type SessionOptions = sessionOptions;
  export interface EventCallBacks{
    start:startEventCallBack[],
    beforeSelect:beforeSelectEventCallBack[],
		afterSelect:afterSelectEventCallBack[],
		beforeCompress:beforeCompressEventCallBack[],
		afterCompress:afterCompressEventCallBack[],

		frameHover:hoverEventCallBack[],
		uploaderHover:hoverEventCallBack[],
    frameSelect:clickEventCallBack[],
		changeButtonClick:clickEventCallBack[]
  }
}

export{BIPP,Bipp}