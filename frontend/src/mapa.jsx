import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const cityCoordinates = {
    "ciudad de mexico": { lat: 19.4326, lng: -99.1332 },
    "miguel hidalgo": { lat: 19.4326, lng: -99.1332 },
    "guadalajara": { lat: 20.6597, lng: -103.3496 },
    "monterrey": { lat: 25.6866, lng: -100.3161 },
    "puebla": { lat: 19.0414, lng: -98.2063 },
    "queretaro": { lat: 20.5900, lng: -100.3900 },
    "leon": { lat: 21.1200, lng: -101.6800 },
    "juarez": { lat: 31.7619, lng: -106.4850 },
    "tijuana": { lat: 32.5149, lng: -117.0382 },
    "merida": { lat: 20.9674, lng: -89.6243 },
    "cancun": { lat: 21.1619, lng: -86.8515 },
    "chihuahua": { lat: 28.6333, lng: -106.0667 },
    "san luis potosi": { lat: 22.1565, lng: -100.9855 },
    "toluca": { lat: 19.2826, lng: -99.6582 },
    "aguascalientes": { lat: 21.8818, lng: -102.2917 },
    "hermosillo": { lat: 29.0892, lng: -110.9610 },
    "saltillo": { lat: 25.4232, lng: -101.0053 },
    "mexicali": { lat: 32.6278, lng: -115.4545 },
    "veracruz": { lat: 19.1738, lng: -96.1342 },
    "culiacan": { lat: 24.7877, lng: -107.4000 },
    "acapulco": { lat: 16.8634, lng: -99.8901 },
    "morelia": { lat: 19.7000, lng: -101.1844 },
    "torreon": { lat: 25.5389, lng: -103.4491 },
    "durango": { lat: 24.0277, lng: -104.6531 },
    "chimalhuacan": { lat: 19.4326, lng: -98.9000 },
    "tlalnepantla de baz": { lat: 19.5397, lng: -99.2183 },
    "benito juarez": { lat: 19.3800, lng: -99.1500 },
    "iztapalapa": { lat: 19.3500, lng: -99.0700 },
    "naucalpan de juarez": { lat: 19.4700, lng: -99.2500 },
    "centro": { lat: 19.4326, lng: -99.1332 },
    "guadalupe": { lat: 25.6667, lng: -100.2000 },
    "la barca": { lat: 20.2833, lng: -102.3833 },
    "xxxx": { lat: 21.8818, lng: -102.2917 },
    "yyyy": { lat: 21.8900, lng: -102.2800 },
    "wwww": { lat: 21.8700, lng: -102.3000 },
    "43200": { lat: 20.6698, lng: -98.6366 },
    "43160": { lat: 20.5739, lng: -98.8142 },
    "42200": { lat: 20.2833, lng: -98.7499 },
    "santa catarina": { lat: 25.6667, lng: -100.4500 }, 
    "zapopan": { lat: 20.7333, lng: -103.4167 },
    "tlaquepaque": { lat: 20.6278, lng: -103.3175 },
    "nezahualcoyotl": { lat: 19.4000, lng: -98.9833 },
    "ciudad nezahualcoyotl": { lat: 19.4000, lng: -98.9833 },
    "ecatepec": { lat: 19.6000, lng: -99.0500 },
    "ecatepec de morelos": { lat: 19.6000, lng: -99.0500 },
    "guadalajara": { lat: 20.6597, lng: -103.3496 },
    "san nicolas de los garza": { lat: 25.7500, lng: -100.2667 },
    "ciudad juarez": { lat: 31.7619, lng: -106.4850 },
    "naucalpan": { lat: 19.4700, lng: -99.2500 },
    "chimalhuacan": { lat: 19.4326, lng: -98.9000 },
    "tlalnepantla": { lat: 19.5397, lng: -99.2183 },
    "cuautitlan izcalli": { lat: 19.6500, lng: -99.2000 },
    "acapulco de juarez": { lat: 16.8634, lng: -99.8901 },
    "villahermosa": { lat: 17.9833, lng: -92.9333 },
    "oaxaca": { lat: 17.0654, lng: -96.7266 },
    "pachuca": { lat: 20.1167, lng: -98.7333 },
    "tuxtla gutierrez": { lat: 16.7500, lng: -93.1167 },
    "chetumal": { lat: 18.5000, lng: -88.3000 },
    "ciudad victoria": { lat: 23.7333, lng: -99.1500 },
    "colima": { lat: 19.2500, lng: -103.7167 },
    "cuernavaca": { lat: 18.9167, lng: -99.2333 },
    "tepic": { lat: 21.5000, lng: -104.8833 },
    "zacatecas": { lat: 22.7667, lng: -102.5667 },
    "ciudad obregon": { lat: 27.4833, lng: -109.9333 },
    "mazatlan": { lat: 23.2500, lng: -106.4167 },
    "la paz": { lat: 24.1428, lng: -110.3108 },
    "cabo san lucas": { lat: 22.8909, lng: -109.9125 },
    "ensenada": { lat: 31.8667, lng: -116.6000 },
    "tampico": { lat: 22.2500, lng: -97.8500 },
    "reynosa": { lat: 26.0833, lng: -98.3000 },
    "matamoros": { lat: 25.8833, lng: -97.5000 },
    "nuevo laredo": { lat: 27.4833, lng: -99.5000 },
    "coatzacoalcos": { lat: 18.1500, lng: -94.4500 },
    "xalapa": { lat: 19.5333, lng: -96.9167 },
    "uruapan": { lat: 19.4167, lng: -102.0667 },
    "celaya": { lat: 20.5167, lng: -100.8167 },
    "irapuato": { lat: 20.6667, lng: -101.3500 },
    "san miguel de allende": { lat: 20.9142, lng: -100.7439 },
    "san juan del rio": { lat: 20.3833, lng: -100.0000 },
    "manzanillo": { lat: 19.0500, lng: -104.3167 },
    "guaymas": { lat: 27.9167, lng: -110.9000 },
    "nogales": { lat: 31.3333, lng: -110.9333 },
    "monclova": { lat: 26.9167, lng: -101.4167 },
    "piedras negras": { lat: 28.7000, lng: -100.5167 },
    "saltillo": { lat: 25.4232, lng: -101.0053 },
    "torreon": { lat: 25.5389, lng: -103.4491 },
    "gomez palacio": { lat: 25.5667, lng: -103.5000 },
    "lerdo": { lat: 25.5500, lng: -103.5667 },
    "fresnillo": { lat: 23.1667, lng: -102.8667 },
    "san cristobal de las casas": { lat: 16.7333, lng: -92.6333 },
    "tapachula": { lat: 14.9000, lng: -92.2667 },
    "campeche": { lat: 19.8333, lng: -90.5167 },
    "ciudad del carmen": { lat: 18.6333, lng: -91.8333 },
    "cozumel": { lat: 20.5000, lng: -86.9500 },
    "playa del carmen": { lat: 20.6296, lng: -87.0739 },
    "tulancingo": { lat: 20.0833, lng: -98.3667 },
    "pachuca de soto": { lat: 20.1167, lng: -98.7333 },
    "tula de allende": { lat: 20.0500, lng: -99.3500 },
    "ciudad valles": { lat: 22.0000, lng: -99.0167 },
    "matehuala": { lat: 23.6500, lng: -100.6500 },
    "san miguel el alto": { lat: 21.0333, lng: -102.3833 },
    "lagos de moreno": { lat: 21.3500, lng: -101.9333 },
    "ocotlan": { lat: 20.3500, lng: -102.7667 },
    "zamora": { lat: 19.9833, lng: -102.2833 },
    "la piedad": { lat: 20.3333, lng: -102.0167 },
    "apaseo el alto": { lat: 20.4833, lng: -100.6333 },
    "san francisco del rincon": { lat: 20.9333, lng: -101.8667 },
    "silao": { lat: 20.9333, lng: -101.4333 },
    "dolores hidalgo": { lat: 20.9167, lng: -100.9333 },
    "salvatierra": { lat: 20.2167, lng: -100.8833 },
    "valle de santiago": { lat: 20.4333, lng: -101.1833 },
    "uriangato": { lat: 20.1333, lng: -101.1833 },
    "moroleon": { lat: 20.1333, lng: -101.1833 },
    "penjamo": { lat: 20.4333, lng: -101.7000 },
    "salamanca": { lat: 20.5667, lng: -101.2000 },
    "san luis de la paz": { lat: 21.3167, lng: -100.5167 },
    "san jose iturbide": { lat: 20.9333, lng: -100.3833 },
    "tarimoro": { lat: 20.2167, lng: -100.6833 },
    "yuriria": { lat: 20.2167, lng: -101.1333 },
    "valle de bravo": { lat: 19.2000, lng: -100.1333 },
    "zitacuaro": { lat: 19.4333, lng: -100.3500 },
    "la huacana": { lat: 18.9167, lng: -101.8000 },
    "apatzingan": { lat: 19.0833, lng: -102.3500 },
    "ciudad hidalgo": { lat: 19.6000, lng: -100.5500 },
    "jiquilpan": { lat: 19.9833, lng: -102.7167 },
    "los reyes": { lat: 19.0500, lng: -102.4833 },
    "maravatio": { lat: 19.9000, lng: -100.4500 },
    "sahuayo": { lat: 20.0500, lng: -102.7167 },
    "tangancicuaro": { lat: 19.9833, lng: -102.1000 },
    "zacapu": { lat: 19.8167, lng: -101.7833 },
    "zihuatanejo": { lat: 17.6333, lng: -101.5500 },
    "iguala": { lat: 18.3500, lng: -99.5333 },
    "chilpancingo": { lat: 17.5500, lng: -99.5000 },
    "taxco": { lat: 18.5500, lng: -99.6000 },
    "petatlan": { lat: 17.5167, lng: -101.2667 },
    "arcelia": { lat: 18.2667, lng: -100.2667 },
    "altamira": { lat: 22.3667, lng: -97.9333 },
    "madero": { lat: 22.2833, lng: -97.8333 },
    "ciudad madero": { lat: 22.2833, lng: -97.8333 },
    "el mante": { lat: 22.7333, lng: -99.0000 },
    "rio bravo": { lat: 25.9000, lng: -98.0833 },
    "valle hermoso": { lat: 25.6833, lng: -97.8333 },
    "san fernando": { lat: 25.0500, lng: -97.7667 },
    "miguel aleman": { lat: 26.3833, lng: -99.0333 },
    "cd. victoria": { lat: 23.7333, lng: -99.1500 },
    "poza rica": { lat: 20.5333, lng: -97.4500 },
    "cordoba": { lat: 18.8833, lng: -96.9333 },
    "orizaba": { lat: 18.8500, lng: -97.1000 },
    "tuxpan": { lat: 20.9500, lng: -97.4000 },
    "minatitlan": { lat: 17.9833, lng: -94.5500 },
    "cosoleacaque": { lat: 17.9833, lng: -94.6333 },
    "san andres tuxtla": { lat: 18.4500, lng: -95.2167 },
    "cosamaloapan": { lat: 18.1667, lng: -95.7833 },
    "tierra blanca": { lat: 18.4500, lng: -96.3500 },
    "boca del rio": { lat: 19.1000, lng: -96.1000 },
    "cardel": { lat: 19.3833, lng: -96.3833 },
    "papantla": { lat: 20.4500, lng: -97.3500 },
    "martinez de la torre": { lat: 20.5667, lng: -97.0500 },
    "teziutlan": { lat: 19.8167, lng: -97.3833 },
    "huauchinango": { lat: 20.2833, lng: -98.0500 },
    "san martin texmelucan": { lat: 19.2833, lng: -98.4333 },
    "cholula": { lat: 19.0667, lng: -98.3000 },
    "atlixco": { lat: 18.9167, lng: -98.4333 },
    "tehuacan": { lat: 18.4667, lng: -97.3833 },
    "apizaco": { lat: 19.4167, lng: -98.1333 },
    "tlaxcala": { lat: 19.3167, lng: -98.2333 },
    "zacatlan": { lat: 19.9333, lng: -97.9833 },
    "chignahuapan": { lat: 19.8333, lng: -98.0333 },
    "san pedro cholula": { lat: 19.0667, lng: -98.3000 },
    "san andres cholula": { lat: 19.0667, lng: -98.3000 },
    "san juan bautista tuxtepec": { lat: 17.9833, lng: -96.1167 },
    "salina cruz": { lat: 16.1833, lng: -95.2000 },
    "juchitan": { lat: 16.4333, lng: -95.0333 },
    "matías romero": { lat: 17.0333, lng: -95.0333 },
    "pinotepa nacional": { lat: 16.3333, lng: -98.0333 },
    "puerto escondido": { lat: 15.8667, lng: -97.0667 },
    "pochutla": { lat: 15.7833, lng: -96.4667 },
    "huatulco": { lat: 15.7667, lng: -96.1167 },
    "san blas": { lat: 21.5500, lng: -105.2833 },
    "compostela": { lat: 21.2333, lng: -104.9167 },
    "bahia de banderas": { lat: 20.7333, lng: -105.3500 },
    "puerto vallarta": { lat: 20.6533, lng: -105.2253 },
    "chapala": { lat: 20.3000, lng: -103.2000 },
    "ciudad guzman": { lat: 19.7000, lng: -103.4667 },
    "autlan de navarro": { lat: 19.7667, lng: -104.3667 },
    "la barca": { lat: 20.2833, lng: -102.3833 },
    "arandas": { lat: 20.7000, lng: -102.3333 },
    "atamajac de brizuela": { lat: 20.2500, lng: -103.8833 },
    "san juan de los lagos": { lat: 21.2333, lng: -102.3167 },
    "tequila": { lat: 20.8833, lng: -103.8333 },
    "tlaquepaque": { lat: 20.6278, lng: -103.3175 },
    "tonala": { lat: 20.6167, lng: -103.2167 },
    "tlajomulco de zuñiga": { lat: 20.5000, lng: -103.3667 },
    "zapotlanejo": { lat: 20.6167, lng: -103.0167 },
    "san pedro tlaquepaque": { lat: 20.6278, lng: -103.3175 },
    "tonala jalisco": { lat: 20.6167, lng: -103.2167 },
    "tlajomulco": { lat: 20.5000, lng: -103.3667 },
    "zapotlanejo jalisco": { lat: 20.6167, lng: -103.0167 },
    "san miguel el alto jalisco": { lat: 21.0333, lng: -102.3833 },
    "lagos de moreno jalisco": { lat: 21.3500, lng: -101.9333 },
    "ocotlan jalisco": { lat: 20.3500, lng: -102.7667 },
    "zamora michoacan": { lat: 19.9833, lng: -102.2833 },
    "la piedad michoacan": { lat: 20.3333, lng: -102.0167 },
    "apaseo el alto guanajuato": { lat: 20.4833, lng: -100.6333 },
    "san francisco del rincon guanajuato": { lat: 20.9333, lng: -101.8667 },
    "silao guanajuato": { lat: 20.9333, lng: -101.4333 },
    "dolores hidalgo guanajuato": { lat: 20.9167, lng: -100.9333 },
    "salvatierra guanajuato": { lat: 20.2167, lng: -100.8833 },
    "valle de santiago guanajuato": { lat: 20.4333, lng: -101.1833 },
    "uriangato guanajuato": { lat: 20.1333, lng: -101.1833 },
    "moroleon guanajuato": { lat: 20.1333, lng: -101.1833 },
    "penjamo guanajuato": { lat: 20.4333, lng: -101.7000 },
    "salamanca guanajuato": { lat: 20.5667, lng: -101.2000 },
    "san luis de la paz guanajuato": { lat: 21.3167, lng: -100.5167 },
    "san jose iturbide guanajuato": { lat: 20.9333, lng: -100.3833 },
    "tarimoro guanajuato": { lat: 20.2167, lng: -100.6833 },
    "yuriria guanajuato": { lat: 20.2167, lng: -101.1333 },
    "valle de bravo estado de mexico": { lat: 19.2000, lng: -100.1333 },
    "zitacuaro michoacan": { lat: 19.4333, lng: -100.3500 },
    "la huacana michoacan": { lat: 18.9167, lng: -101.8000 },
    "apatzingan michoacan": { lat: 19.0833, lng: -102.3500 },
    "ciudad hidalgo michoacan": { lat: 19.6000, lng: -100.5500 },
    "jiquilpan michoacan": { lat: 19.9833, lng: -102.7167 },
    "los reyes michoacan": { lat: 19.0500, lng: -102.4833 },
    "maravatio michoacan": { lat: 19.9000, lng: -100.4500 },
    "sahuayo michoacan": { lat: 20.0500, lng: -102.7167 },
    "tangancicuaro michoacan": { lat: 19.9833, lng: -102.1000 },
    "zacapu michoacan": { lat: 19.8167, lng: -101.7833 },
    "zihuatanejo guerrero": { lat: 17.6333, lng: -101.5500 },
    "iguala guerrero": { lat: 18.3500, lng: -99.5333 },
    "chilpancingo guerrero": { lat: 17.5500, lng: -99.5000 },
    "taxco guerrero": { lat: 18.5500, lng: -99.6000 },
    "petatlan guerrero": { lat: 17.5167, lng: -101.2667 },
    "arcelia guerrero": { lat: 18.2667, lng: -100.2667 },
    "altamira tamaulipas": { lat: 22.3667, lng: -97.9333 },
    "madero tamaulipas": { lat: 22.2833, lng: -97.8333 },
    "el mante tamaulipas": { lat: 22.7333, lng: -99.0000 },
    "rio bravo tamaulipas": { lat: 25.9000, lng: -98.0833 },
    "valle hermoso tamaulipas": { lat: 25.6833, lng: -97.8333 },
    "san fernando tamaulipas": { lat: 25.0500, lng: -97.7667 },
    "miguel aleman tamaulipas": { lat: 26.3833, lng: -99.0333 },
    "cd. victoria": { lat: 23.7333, lng: -99.1500 },
    "poza rica veracruz": { lat: 20.5333, lng: -97.4500 },
    "cordoba veracruz": { lat: 18.8833, lng: -96.9333 },
    "orizaba veracruz": { lat: 18.8500, lng: -97.1000 },
    "tuxpan veracruz": { lat: 20.9500, lng: -97.4000 },
    "minatitlan veracruz": { lat: 17.9833, lng: -94.5500 },
    "cosoleacaque veracruz": { lat: 17.9833, lng: -94.6333 },
    "san andres tuxtla veracruz": { lat: 18.4500, lng: -95.2167 },
    "cosamaloapan veracruz": { lat: 18.1667, lng: -95.7833 },
    "tierra blanca veracruz": { lat: 18.4500, lng: -96.3500 },
    "boca del rio veracruz": { lat: 19.1000, lng: -96.1000 },
    "cardel veracruz": { lat: 19.3833, lng: -96.3833 },
    "papantla veracruz": { lat: 20.4500, lng: -97.3500 },
    "martinez de la torre veracruz": { lat: 20.5667, lng: -97.0500 },
    "teziutlan puebla": { lat: 19.8167, lng: -97.3833 },
    "huauchinango puebla": { lat: 20.2833, lng: -98.0500 },
    "san martin texmelucan puebla": { lat: 19.2833, lng: -98.4333 },
    "cholula puebla": { lat: 19.0667, lng: -98.3000 },
    "atlixco puebla": { lat: 18.9167, lng: -98.4333 },
    "tehuacan puebla": { lat: 18.4667, lng: -97.3833 },
    "apizaco tlaxcala": { lat: 19.4167, lng: -98.1333 },
    "tlaxcala tlaxcala": { lat: 19.3167, lng: -98.2333 },
    "zacatlan puebla": { lat: 19.9333, lng: -97.9833 },
    "chignahuapan puebla": { lat: 19.8333, lng: -98.0333 },
    "san juan bautista tuxtepec oaxaca": { lat: 17.9833, lng: -96.1167 },
    "salina cruz oaxaca": { lat: 16.1833, lng: -95.2000 },
    "juchitan oaxaca": { lat: 16.4333, lng: -95.0333 },
    "matias romero oaxaca": { lat: 17.0333, lng: -95.0333 },
    "pinotepa nacional oaxaca": { lat: 16.3333, lng: -98.0333 },
    "puerto escondido oaxaca": { lat: 15.8667, lng: -97.0667 },
    "pochutla oaxaca": { lat: 15.7833, lng: -96.4667 },
    "huatulco oaxaca": { lat: 15.7667, lng: -96.1167 },
    "san blas nayarit": { lat: 21.5500, lng: -105.2833 },
    "compostela nayarit": { lat: 21.2333, lng: -104.9167 },
    "bahia de banderas nayarit": { lat: 20.7333, lng: -105.3500 },
    "puerto vallarta jalisco": { lat: 20.6533, lng: -105.2253 },
    "chapala jalisco": { lat: 20.3000, lng: -103.2000 },
    "ciudad guzman jalisco": { lat: 19.7000, lng: -103.4667 },
    "autlan de navarro jalisco": { lat: 19.7667, lng: -104.3667 },
    "arandas jalisco": { lat: 20.7000, lng: -102.3333 },
    "atamajac de brizuela jalisco": { lat: 20.2500, lng: -103.8833 },
    "san juan de los lagos jalisco": { lat: 21.2333, lng: -102.3167 },
    "tequila jalisco": { lat: 20.8833, lng: -103.8333 },
    "gomez palacio durango": { lat: 25.5667, lng: -103.5000 },
    "lerdo durango": { lat: 25.5500, lng: -103.5667 },
    "fresnillo zacatecas": { lat: 23.1667, lng: -102.8667 },
    "san cristobal de las casas chiapas": { lat: 16.7333, lng: -92.6333 },
    "tapachula chiapas": { lat: 14.9000, lng: -92.2667 },
    "campeche campeche": { lat: 19.8333, lng: -90.5167 },
    "ciudad del carmen campeche": { lat: 18.6333, lng: -91.8333 },
    "cozumel quintana roo": { lat: 20.5000, lng: -86.9500 },
    "playa del carmen quintana roo": { lat: 20.6296, lng: -87.0739 },
    "tulancingo hidalgo": { lat: 20.0833, lng: -98.3667 },
    "tula de allende hidalgo": { lat: 20.0500, lng: -99.3500 },
    "ciudad valles san luis potosi": { lat: 22.0000, lng: -99.0167 },
    "matehuala san luis potosi": { lat: 23.6500, lng: -100.6500 },
};

const Mapa = ({ userLocation, offers }) => {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (!leafletMapRef.current) {
            leafletMapRef.current = L.map(mapRef.current, {
                center: userLocation ? [userLocation.lat, userLocation.lng] : [19.4326, -99.1332],
                zoom: userLocation ? 13 : 6,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(leafletMapRef.current);
        }

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        if (userLocation) {
            const userMarker = L.marker([userLocation.lat, userLocation.lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(leafletMapRef.current);
            userMarker.bindPopup("<b>Tu ubicación actual</b>").openPopup();
            markersRef.current.push(userMarker);
            leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 13);
        }

        const stripAccents = (str) => {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };

        const groupedOffers = new Map();

        offers.forEach(offer => {
            const rawUbicacion = offer.ubicacion ? String(offer.ubicacion).toLowerCase().trim() : '';
            let coords = null;

            if (rawUbicacion.match(/^\d{5}$/)) {
                coords = cityCoordinates[rawUbicacion];
            }
            
            if (!coords) {
                const cleanUbicacion = stripAccents(rawUbicacion.replace(/,.*/, '').trim());
                coords = cityCoordinates[cleanUbicacion];
            }

            if (coords) {
                const coordsKey = `${coords.lat},${coords.lng}`;
                if (!groupedOffers.has(coordsKey)) {
                    groupedOffers.set(coordsKey, []);
                }
                groupedOffers.get(coordsKey).push(offer);
            }
        });

        groupedOffers.forEach((offersInGroup, coordsKey) => {
            const [baseLat, baseLng] = coordsKey.split(',').map(Number);
            const numOffers = offersInGroup.length;
            const jitterAmount = 0.015;

            if (isNaN(baseLat) || isNaN(baseLng)) {
                console.warn(`Skipping marker for invalid coordinates: ${coordsKey}`);
                return;
            }

            offersInGroup.forEach((offer, index) => {
                let finalLat = baseLat;
                let finalLng = baseLng;

                if (numOffers > 1) {
                    const angle = (2 * Math.PI / numOffers) * index;
                    const radius = jitterAmount * Math.sqrt(index + 1);
                    
                    finalLat = baseLat + radius * Math.cos(angle);
                    finalLng = baseLng + radius * Math.sin(angle);
                }

                const offerMarker = L.marker([finalLat, finalLng], {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                }).addTo(leafletMapRef.current);

                const popupContent = `
                    <b>${offer.titulo || 'Sin título'}</b><br/>
                    Empresa: ${offer.empresa || 'No especificado'}<br/>
                    Ubicación: ${offer.ubicacion || 'No especificado'}<br/>
                    Salario: ${offer.salario || 'No especificado'}<br/>
                    <a href="${offer.url}" target="_blank" rel="noopener noreferrer">Ver oferta</a> 
                `;

                offerMarker.bindPopup(popupContent);
                offerMarker.on('mouseover', function (e) {
                    this.openPopup();
                });
                offerMarker.on('mouseout', function (e) {
                    this.closePopup();
                });
                markersRef.current.push(offerMarker);
            });
        });

        if (markersRef.current.length > 0 && leafletMapRef.current) {
            const group = new L.featureGroup(markersRef.current);
            if (group.getBounds().isValid()) {
                leafletMapRef.current.fitBounds(group.getBounds().pad(0.5));
            } else {
                console.warn("Los límites del grupo de marcadores no son válidos. Es posible que no haya marcadores visibles o que sus coordenadas sean incorrectas.");
            }
        } else if (leafletMapRef.current) {
            console.log("No hay marcadores para mostrar en el mapa.");
        }

    }, [userLocation, offers]);

    return (
        <div ref={mapRef} style={{ height: '500px', width: '100%' }} className="rounded-lg shadow-md"></div>
    );
};

export default Mapa;