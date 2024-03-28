import { Accessor } from 'solid-js';
import { SVG } from '../../assets/svg-content';
import './svg.scss';

type SVGProps = {
    name: string | Accessor<string>;
    size?: number;
}

export default function SvgIcon({name: getName, size=24}: SVGProps) {
    const name = typeof getName === 'function' ? getName() : getName;
    const target = name in SVG ? name : Object.keys(SVG)[0] as keyof typeof SVG;
    const pathList = SVG[target].d;
    const viewBox = SVG[target].viewBox || '0 -960 960 960';
    return (
        <svg class={name} xmlns="http://www.w3.org/2000/svg" height={size} viewBox={viewBox} width={size}>
            {pathList.map((path) => <path  d={path}/>)}
        </svg>
    );
}