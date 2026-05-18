export default interface BodyProps {
    onTitleChange:(name:string)=>void,
    onContentChange:(content:string)=>void,
    onBodyUpload:(title:string, content:string)=>void,
    onUploadError:(msg:string)=>void;
}