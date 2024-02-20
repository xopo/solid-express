import {Response} from 'express';

export async function prepStream(res: Response) {
    if (!res) {
        console.log(' do nothing on prepare stream')
        return;
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Connection', 'keep-alive');
    // disable buffering on ngninx
    // res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders()
    // res.flushHeaders()
    res.on('close', () => res.end());
    console.info('all header are prepared')
}