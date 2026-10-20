import {randomBelow} from './lucky-numbers.js';
// Choose a different local image whenever there is more than one.
export function randomPhoto(photos,currentId,random=randomBelow){
 const candidates=photos.filter(photo=>photo.id!==currentId);
 const pool=candidates.length?candidates:photos;return pool.length?pool[random(pool.length)]:null;
}
