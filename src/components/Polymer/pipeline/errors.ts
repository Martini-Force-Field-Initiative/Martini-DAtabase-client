class PipelineRunTimeError extends Error {
    constructor(msg: string) {
        super(msg);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, PipelineRunTimeError.prototype);
    }
}
export class PipelineBoxError extends PipelineRunTimeError {
    constructor(msg: string) {
        super(msg);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, PipelineBoxError.prototype);
    }
}
export class PipelineDisjointError extends PipelineRunTimeError {
    constructor(msg: string) {
        super(msg);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, PipelineDisjointError.prototype);
    }
}
export class PipelineOSError extends PipelineRunTimeError {
    constructor(msg: string) {
        super(msg);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, PipelineOSError.prototype);
    }
}


export class PipelineUnknownError extends PipelineRunTimeError {
    constructor(msg: string) {
        super(msg);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, PipelineUnknownError.prototype);
    }
}

// Valuable Error below
export class PipelineLinkError extends PipelineRunTimeError {
    linksErrors:[string, string][];
    ItpWithMissingLinks:string;

    constructor(msg: string, linksErrors:[string, string][], itp:string) {
        super(msg);
           // Set the prototype explicitly.
        Object.setPrototypeOf(this, PipelineLinkError.prototype);

        this.linksErrors = linksErrors;
        this.ItpWithMissingLinks = itp;
     
       
    }
}

export interface ErrorLogFromPBServer {
    boxerror: boolean;
    ok: boolean,
    disjoint: boolean,
    errorlinks: any[],
    message: string[],
    itp? : string,
}
export function errorSorter(e:any):PipelineRunTimeError {
    if (!isErrorLogFromPBServer(e))
        return e as PipelineRunTimeError;
    const el = extractErrorLinks(e);
    if(el!==undefined) {
        console.warn("error sorting a new PipelineLinkError");
        if(e.itp == undefined)
            throw("[Polymer:pipeline:error] Fatal:ITP is not found in a link Error packet");        
        return new PipelineLinkError(`Generate ITP ${el.length} link error`, el, e.itp as string);
    }
    if (e.boxerror) 
        return new PipelineBoxError("Box is too small. Please increase the value.");
    if (e.disjoint) 
        return new PipelineDisjointError("Your molecule consists of disjoint parts.Perhaps links were not applied correctly.");

    const maybeOsError = translateFirstOsError(e);
    if (maybeOsError !== undefined) {
        return new PipelineOSError(maybeOsError)
    }
    
    return new PipelineUnknownError(e.message.join("\n"));
}
export function isErrorLogFromPBServer(x: any): x is ErrorLogFromPBServer {
    /**
     * Naive ErrorLogFromPBServer typeguard
     * 'boxerror' in x && 'ok' in x && 'disjoint' in x && 'errorlinks' in x && 'message' in x
     */
    if(typeof(x) !== 'object')
        return false;
    return 'boxerror' in x && 'ok' in x && 'disjoint' in x && 'errorlinks' in x && 'message' in x;
}

export const extractErrorLinks = (x:ErrorLogFromPBServer):undefined|[string ,string][] => {
    const res:[string,string][] = [];
    console.warn(`[PolymerBuilderData:extractErrorLinks] from`)
    console.warn(x.errorlinks);
    for (let i of x.errorlinks) {
        res.push([i[1].toString(), i[3].toString()])
    }
    if(res.length === 0)
        return undefined;
    return res
}
export const translateFirstOsError = (x:ErrorLogFromPBServer):string|undefined => {
    /**
     * Extract log strings concerning backend Os errors
     */
    const osErrorRegex = /OSError:[\s]*(.+)$/;
    if (x.message.length === 0)
        return undefined;
    
    console.warn(x.message);
    
    let cleanLogs = '';
    x.message.forEach((line: string) => {
        let m = line.match(osErrorRegex);
        if(!m)
            return;
        cleanLogs += m[1] + "\n";
    }) 
    if(cleanLogs === '')
        return undefined;

    return cleanLogs
}
/* This is deprecated as linksnotapplied is not produced by backend anymore
export const translateLinksNotApplied(x:ErrorLogFromPBServer):string|undefined => {
    if (x.linksnotapplied.length  === 0) 
        return undefined;
    let out = ''
    for (let pb of x.linksnotapplied) 
    x.linksnotapplied.forEach((pb)=>
        out += "residue number " + pb[1] + " (" + pb[0] + ") and residue number " + pb[3] + " (" + pb[2] + "),"
    );

    return out;
}
*/