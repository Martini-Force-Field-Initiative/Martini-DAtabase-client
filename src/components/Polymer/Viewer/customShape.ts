import * as d3 from "d3";

interface CircularShapePoint {
    pos:number;
    value:number;
}

export const generateBlurShape = (size:number) => {
    /*
       Should come back on this for fun
    */

    // scaling down size to match default d3 shape sizes
    const PI = Math.PI;
    const cos = Math.cos;

    size /= 50;

    const lineRadialGenerator = d3.lineRadial(); 

    const waveResolution = 50;
    const waveNumber     = 8;
    const wScale = d3.scaleLinear()
        .domain([0, waveResolution])
        .range( [ 5*(PI/4), 3*(PI/4) ])
        //.range( [ 3*(PI/2), PI/2 ])
        //.range([0, 2 * Math.PI]);

    const hCrestFactor = 1.
    const raw_data = [...new Array(waveResolution *waveNumber)]/* not exact*/
        .map(
            (_, x) => {
                //console.log(x, "%", waveResolution, "==",  x%waveResolution, 
                //     wScale(x%waveResolution), "=>", (-1) * cos( wScale(x%waveResolution) ))
                x = x%waveResolution;
                return (-1) * cos( wScale(x) )
                //return (Math.cos( wScale(x) ) + 2 ) * hCrestFactor;
            }

        )      

    const x = d3.scaleLinear()
        .domain([0, raw_data.length])
        .range([0, 2 * Math.PI]);

    const data:[number, number][] = raw_data
        .map((v,i) => [x(i), (v * size  * 5)]);
    //console.log("BlurShape Specs");
    //console.dir(data);
    return lineRadialGenerator(data);
}

export const generateBlurShape00 = (size:number) => {
    /*
       Should come back on this for fun
    */

    // scaling down size to match default d3 shape sizes
    size /= 100;

    const lineRadialGenerator = d3.lineRadial(); 

    const waveResolution = 50;
    const waveNumber     = 10;
    const wScale = d3.scaleLinear()
        .domain([0, waveResolution])
        .range([0, 2 * Math.PI]);

    const hCrestFactor = 1.
    const raw_data = [...new Array(waveResolution *waveNumber)]/* not exact*/
        .map(
            (_, x) => {
                console.log(x, "%", waveResolution, wScale(x), "=>", Math.cos( wScale(x) ))
                x = x%waveResolution;
                return (Math.cos( wScale(x) ) + 2 ) * hCrestFactor;
            }

        )      

    const x = d3.scaleLinear()
        .domain([0, raw_data.length])
        .range([0, 2 * Math.PI]);

    const data:[number, number][] = raw_data
        .map((v,i) => [x(i), (v * size  * 5)]);

    return lineRadialGenerator(data);
}

export const generateBlurShape0 = (size:number) => {
    const lineRadialGenerator = d3.lineRadial(); 
    const data_sz = 5 * size;
    const smooth  = 5;

    const innerRadius = 0;//(3/4) * size;
    const outerRadius = (5/4) * size;

    const raw_data = [...new Array(data_sz)].map( (v,i)=> d3.randomInt(10, 90)())
    
    const x = d3.scaleLinear()
        .domain([0, data_sz])
        .range([0, 2 * Math.PI]);
    const y = d3.scaleLinear()
        .domain([d3.min(raw_data) as number, d3.max(raw_data) as number])
        .range([size * (3/4), size * (5/4)]);
    const data:[number, number][] = raw_data
        .map((v,i) => {
            let new_v = 0;
            for (let j = i - smooth; j < i + smooth; j++) {
                if (j >= 0 && j < data_sz)
                    new_v += raw_data[j];
                if(j < 0)
                    new_v += raw_data[data_sz + j];
                if (j >= data_sz)
                    new_v += raw_data[j - data_sz];
            }
            return [ x(i), y(new_v / smooth)] as [number, number];
        });

    return lineRadialGenerator(data);
}

export const generateBlurShape1 = (size:number) => {
    const lineRadialGenerator = d3.lineRadial(); 
    const data = [ 
        [0, size], 
        [(Math.PI * 0.25), size], 
        [(Math.PI * 0.5), size], 
        [(Math.PI * 0.75), size], 
        [(Math.PI), size], 
        [(Math.PI * 1.25), size], 
        [(Math.PI * 1.5), size], 
        [(Math.PI * 1.75), size], 
        [(Math.PI * 2), size] 
    ]; 
    //@ts-ignore
    return lineRadialGenerator(data); 
}
export const generateBlurShape2 = (size:number) => {
    const data_sz = 100 * size;
    const smooth  = 5;

    const innerRadius = 0;//(3/4) * size;
    const outerRadius = (5/4) * size;

    const raw_data = [...new Array(data_sz)].map( (v,i)=> d3.randomInt(10, 90)())
    const data:CircularShapePoint[] = raw_data
        .map((v,i) => {
            let new_v = 0;
            for (let j = i - smooth; j < i + smooth; j++) {
                if (j >= 0 && j < data_sz)
                    new_v += raw_data[j];
                if(j < 0)
                    new_v += raw_data[data_sz + j];
                if (j >= data_sz)
                    new_v += raw_data[j - data_sz];
            }
            return { pos:i, value:new_v / smooth};
        });

    console.log(raw_data);   
    console.log(data);         

    const area = d3.areaRadial()
        .curve(d3.curveLinearClosed)
        //@ts-ignore
        .angle( (d) => x(d.pos));

    const x = d3.scaleLinear()
        .domain([0, data_sz])
        .range([0, 2 * Math.PI]);
    
    const y = d3.scaleRadial()
        .domain([(-1) * (d3.max(data, d=>d.value) as number), d3.max(data, d=>d.value)] as [number, number])
        .range([innerRadius, outerRadius]);

    return area
            // @ts-ignore  
            .innerRadius(d => y( (-1) * d.value))
            // @ts-ignore
            .outerRadius(d => y(   d.value     ))(data);

}