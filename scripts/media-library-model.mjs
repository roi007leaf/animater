// Shared by library discovery, recipe validation and runtime preflight.
export function mediaType(file) {
  const ext = String(file).split('.').at(-1)?.toLowerCase();
  if (['ogg', 'mp3', 'wav', 'flac', 'm4a', 'aac'].includes(ext)) return 'audio';
  if (['webm', 'mp4', 'm4v'].includes(ext)) return 'animation';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'svg'].includes(ext)) return 'image';
  return null;
}
export function safeMediaFile(file, type) {
  if (typeof file !== 'string' || !/^(?![\\/]|.*(?:\.\.|:|[<>"'\x00-\x1f]))[^?#]+$/.test(file)) return false;
  const actual = mediaType(file);
  return !!actual && (!type || actual === type || (type === 'audio' && /\.webm$/i.test(file)));
}
export const databaseKey = value => typeof value === 'string' && /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+$/.test(value);
export const visualReference = value => databaseKey(value) || (safeMediaFile(value) && mediaType(value) !== 'audio');
export const fileValues = value => typeof value === 'string' ? [value] : Array.isArray(value)
  ? value.flatMap(fileValues) : value && typeof value === 'object' ? Object.values(value).flatMap(fileValues) : [];
export const words = value => String(value ?? '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_.\-/]+/g, ' ').replace(/\s+/g, ' ').trim();
export const title = value => words(value).replace(/\b\w/g, c => c.toUpperCase());
export function mediaFolderSources(value) {
  const sources=new Map();
  for(const row of Array.isArray(value)?value:[]) {
    const path=typeof row?.path==='string'?row.path.trim().replace(/\/+$/,''):'';
    if(!path||path.length>1500||/^[\\/]|[\\:<>"'?#\x00-\x1f]|(?:^|\/)\.{1,2}(?:\/|$)|(?:^|\/)(?:\.git|node_modules)(?:\/|$)/.test(path)||path.includes('//'))continue;
    const name=typeof row.name==='string'?row.name.trim().slice(0,100):'';
    sources.set(path,{path,name:name.replace(/[\x00-\x1f]/g,'')||title(path.split('/').at(-1))});
    if(sources.size>=50)break;
  }
  return [...sources.values()];
}
const palettes = ['bluepurple','blueteal','greenpurple','pinkyellow','greenyellow','orangeyellow','purplered','greenorange','darkpurple','darkred','darkblue','lightblue','blue','green','orange','purple','red','yellow','white','black','pink','grey','gray','brown','rainbow','multicolored'];
export function assetColor(key, file = '') {
  const tokens = (key + ' ' + file.split('/').at(-1)).toLowerCase().replace(/[^a-z]+/g, ' ').split(' ');
  return palettes.find(c => tokens.includes(c)) ?? 'none';
}
// Database dimensions describe a variant. File pixel dimensions describe the
// video resolution and must not become footprint choices.
const sizeToken = /^(?:\d+x\d+|tiny|small|medium|large|huge|gargantuan)$/i;
const compareNames=new Intl.Collator(undefined,{numeric:true}).compare;
export const variantSize = item => item?.type === 'audio' || safeMediaFile(item?.key)
  ? '' : String(item?.key ?? '').split('.').find(part => sizeToken.test(part))?.toLowerCase() ?? '';
const variantStem = item => String(item.key ?? item.file).split('.').map(part =>
  sizeToken.test(part) ? '@size' : assetColor(part) !== 'none' ? '@color' : part).join('.');
export function matchingMediaVariant(variants, current, {color = current?.color, size = variantSize(current)} = {}) {
  if (!current) return null;
  const candidates = variants.filter(item => item.color === color && variantSize(item) === size);
  return candidates.find(item => item.id === current.id)
    ?? candidates.find(item => variantStem(item) === variantStem(current))
    ?? candidates[0] ?? null;
}
export function mediaVariantChoices(variants, current) {
  const sort = compareNames;
  const namedSizes = ['tiny','small','medium','large','huge','gargantuan'];
  const sizeSort = (a,b) => namedSizes.includes(a)&&namedSizes.includes(b)
    ? namedSizes.indexOf(a)-namedSizes.indexOf(b) : sort(a,b);
  const choice = (value, axis) => ({value, selected: value === (axis === 'color' ? current.color : variantSize(current)),
    available: !!matchingMediaVariant(variants, current, {[axis]:value})});
  return {
    colors:[...new Set(variants.map(item => item.color))].sort(sort).map(value => choice(value,'color')),
    sizes:[...new Set(variants.map(variantSize))].sort(sizeSort).map(value => choice(value,'size')),
    variants:variants.filter(item => item.color === current.color && variantSize(item) === variantSize(current)),
  };
}
export function assetCategory(text, type) {
  text = words(text).toLowerCase();
  if (type === 'audio') {
    if (/ambient|ambience|loop|tavern|forest|wind|rain|crowd|waterfall/.test(text)) return 'Ambience';
    if (/weapon|sword|arrow|bow|gun|bullet|punch|kick|metal|axe|slash/.test(text)) return 'Weapons';
    if (/creature|monster|beast|dragon|animal|wolf|growl|roar/.test(text)) return 'Creatures';
    if (/magic|spell|fire|ice|lightning|arcane|heal|buff|cast|force/.test(text)) return 'Magic';
    if (/footstep|jump|door|glass|wood|stone|body|impact|hit/.test(text)) return 'Actions';
    return 'Other';
  }
  if (/template|volley|fireball|explosion|erupt/.test(text)) return 'Areas';
  if (/bullet|bolt|beam|ray|missile|projectile|arrow|ranged/.test(text)) return 'Projectiles';
  if (/melee|sword|axe|flail|pickaxe|weapon|slash|claw|bite/.test(text)) return 'Weapons';
  if (/fog|smoke|rain|snow|weather|wind/.test(text)) return 'Weather';
  if (/cast|charge|intro/.test(text)) return 'Casting';
  if (/impact|hit|outro/.test(text)) return 'Impacts';
  if (/aura|shield|ward|buff|condition|border|loop|energy strands/.test(text)) return 'Auras & loops';
  return 'Other';
}
function familyFor(item) {
  if (item.type === 'audio' || !item.key || safeMediaFile(item.key)) {
    return item.file.split('/').at(-1).replace(/\.[^.]+$/, '').replace(/(?:[-_ ](?:\d+|\d+ft))+$/i, '');
  }
  const parts = item.key.split('.').slice(1);
  if (/^(melee_attack|template_circle|template_square|volley_of_projectiles)/i.test(parts[0])) {
    return [parts[0], parts.slice(1).find(p => !/^\d+$/.test(p))].filter(Boolean).join('.');
  }
  return parts[0];
}
export function libraryItem(item) {
  if(!item||typeof item!=='object')return null;
  if(item.type==='tokenfx') {
    const name=typeof item.fxPreset==='string'?item.fxPreset.trim():'';
    if(!name||name.length>100||/[\x00-\x1f]/.test(name)||!['tmfx-main','tmfx-region'].includes(item.fxLibrary))return null;
    const filterTypes=[...new Set((Array.isArray(item.filterTypes)?item.filterTypes:[]).filter(v=>typeof v==='string'&&/^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(v)))];
    const text=words(name+' '+filterTypes.join(' ')).toLowerCase();
    const category=/aura|field|mantle/.test(text)?'Auras & fields':/fire|ice|glacial|electric|water|earth|air|flood/.test(text)?'Elemental':/shadow|outline|bevel|glow|bloom/.test(text)?'Outlines & light':/distortion|warp|twist|bulge|waves|shockwave|blur/.test(text)?'Distortion':'Appearance';
    return {type:'tokenfx',id:`tokenfx:${item.fxLibrary}:${name}`,fxPreset:name,fxLibrary:item.fxLibrary,
      filterTypes,tintable:item.tintable===true,label:title(name),source:'Token Magic FX',family:name,
      category,file:'',files:[],color:'none',loop:true,
      search:words(`${name} ${item.fxLibrary} Token Magic FX token filter shader ${filterTypes.join(' ')} ${category}`).toLowerCase()};
  }
  const file = typeof item.file==='string'?item.file.replace(/^\//, ''):'';
  const type = item.type ?? mediaType(file);
  if (!safeMediaFile(file, type)) return null;
  const source = item.source ?? item.pack ?? item.module ?? item.key?.split('.')[0] ?? 'Custom files';
  const family = item.family ?? familyFor({...item, type, file});
  const color = assetColor(item.key ?? '', file);
  return {...item, file, type, source, family, color,
    id: item.id ?? (type === 'audio' ? `audio:${file}` : item.key ?? file),
    label: item.label ?? title(family),
    category: item.category ?? assetCategory(type==='audio' ? (item.key ?? '') + ' ' + file : item.key ?? file, type),
    loop: /(?:^|[._/ -])loop(?:[._/ -]|$)/i.test((item.key ?? '') + ' ' + file),
    search: words((item.key ?? '') + ' ' + family + ' ' + source + ' ' + file).toLowerCase(),
    files: [...new Set([file, ...fileValues(item.files), ...fileValues(item.distanceFiles)].filter(f => safeMediaFile(f, type)))],
  };
}
export function tokenFxAssets(catalog) {
  if(!catalog?.tokenReady)return [];
  return (catalog.presets??[]).map(p=>libraryItem({type:'tokenfx',fxPreset:p.name,fxLibrary:p.library,filterTypes:p.filterTypes,tintable:p.tintable})).filter(Boolean);
}
// Only public namespaces; include every file variation, not only curated cues.
export function registeredMedia(database) {
  let namespaces;
  try { namespaces = database?.searchFor?.(''); } catch { namespaces = []; }
  if (!Array.isArray(namespaces)) namespaces = database?.entryExists?.('jb2a') ? ['jb2a'] : [];
  const result = [];
  for (const namespace of namespaces) {
    let keys;
    try { keys = database.getPathsUnder(namespace, {fullyQualified:true}); } catch { continue; }
    for (const key of [...new Set(Array.isArray(keys) ? keys : [])]) {
      try {
        const raw = database.getEntry?.(key, {softFail:true});
        const entry = Array.isArray(raw) ? raw.find(e => e.dbPath === key) ?? raw[0] : raw;
        const files = [...new Set(fileValues(database.getAllFileEntries?.(key)).filter(f => safeMediaFile(f)))];
        const preferred = fileValues(entry?.getFile?.('15ft')).find(f => safeMediaFile(f)) ?? files[0];
        if (!preferred) continue;
        if (!files.includes(preferred)) files.unshift(preferred);
        const type = mediaType(preferred);
        if (type === 'audio') {
          result.push(...files.filter(f => mediaType(f) === 'audio').map(file => libraryItem({key, file, type, source:namespace})));
        } else {
          const size = preferred.match(/_(\d+)x(\d+)\.[^.]+$/i);
          result.push(libraryItem({key, file:preferred, files, type, source:namespace,
            name:key.slice(namespace.length + 1).replaceAll('_',' ').replaceAll('.', ' · '),
            ...(Array.isArray(entry?.template) ? {template:[...entry.template]} : {}),
            ...(size ? {width:Number(size[1]),height:Number(size[2])} : {})}));
        }
      } catch { /* One unavailable entry must not hide other libraries. */ }
    }
  }
  return result.filter(Boolean);
}
export function mergeMedia(...lists) {
  const unique = new Map();
  for (const entry of lists.flat()) {
    const item = libraryItem(entry);
    if (item) unique.set(item.id, {...unique.get(item.id), ...item});
  }
  return [...unique.values()];
}
// Existing rows are a normalized library snapshot. Validate only additions;
// progressive discovery must not reprocess every prior file on each batch.
export function appendMedia(existing,...lists) {
  const unique=new Map(existing.map(item=>[item.id,item]));
  for(const entry of lists.flat()) {
    const item=libraryItem(entry);
    if(item)unique.set(item.id,{...unique.get(item.id),...item});
  }
  return [...unique.values()];
}
export function mediaGroups(items, filters = {}, collections = {}) {
  const terms = words(filters.search).toLowerCase().split(' ').filter(Boolean);
  const synonyms = {cold:['cold','ice','frost','snow'],ice:['ice','cold','frost'],healing:['healing','heal','cure'],lightning:['lightning','electric','thunder'],sound:['sound','audio']};
  const matches = items.filter(item =>
    (!filters.type || filters.type === 'all' || item.type === filters.type) &&
    (!filters.source || filters.source === 'all' || item.source === filters.source) &&
    (!filters.category || filters.category === 'all' || item.category === filters.category) &&
    (!filters.color || filters.color === 'all' || item.color === filters.color) &&
    (!filters.loop || filters.loop === 'all' || item.loop === (filters.loop === 'loop')) &&
    (filters.collection !== 'favorites' || collections.favorites?.includes(item.id)) &&
    (filters.collection !== 'recent' || collections.recent?.includes(item.id)) &&
    terms.every(term => (synonyms[term] ?? [term]).some(t => item.search.includes(t))));
  const groups = new Map();
  for (const item of matches) {
    const id = filters.grouped === false ? item.id : `${item.type}:${item.source}:${item.family}`;
    if (!groups.has(id)) groups.set(id, {id, label:item.label, variants:[]});
    groups.get(id).variants.push(item);
  }
  const result = [...groups.values()];
  if (filters.collection === 'recent') result.sort((a,b) => Math.min(...a.variants.map(v => collections.recent.indexOf(v.id))) - Math.min(...b.variants.map(v => collections.recent.indexOf(v.id))));
  else result.sort((a,b) => compareNames(a.label,b.label) * (filters.sort === 'za' ? -1 : 1));
  return {groups:result, count:matches.length};
}
export function mediaForReference(catalog, reference) {
  const media = catalog.find(a => a.type!=='tokenfx'&&(a.key === reference || a.file === reference || a.files?.includes(reference)));
  if (media && media.key !== reference && safeMediaFile(reference)) {
    const size = reference.match(/_(\d+)x(\d+)\.[^.]+$/i);
    return {...media,file:reference,...(size ? {width:Number(size[1]),height:Number(size[2])} : {})};
  }
  return media ?? (safeMediaFile(reference) ? libraryItem({key:reference,file:reference,source:'Custom files'}) : null);
}
