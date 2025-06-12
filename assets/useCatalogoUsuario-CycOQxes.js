import{r as n}from"./index-XnMTmJ1N.js";import{s as j}from"./useUsuario-DUZRc8QX.js";function B(c,f){const[s,h]=n.useState([]),[g,p]=n.useState([]),[L,b]=n.useState(!1),[q,u]=n.useState(null),[x,m]=n.useState([]),[A,S]=n.useState([]),[N,_]=n.useState([]);n.useEffect(()=>{(async()=>{if(!(!c||!c.id)){b(!0),u(null);try{const{data:a,error:i}=await j.from("catalogo_usuario").select(`
              id,
              contenido_id,
              estado,
              favorito,
              puntuacion,
              contenido:contenido (
                id,
                imagen,
                tipo,
                media_type,
                anio,
                nombre,
                contenido_traducciones!contenido_id (
                  idioma,
                  nombre,
                  sinopsis
                )
              )
            `).eq("user_id",c.id);if(i){console.error("Error al cargar catálogo:",i),u(i);return}if(!a){console.warn("No se han recibido datos del catálogo.");return}const r=await Promise.all(a.map(async o=>{var d,l,C,w,y,D,E,v,F;const t=(l=(d=o.contenido)==null?void 0:d.contenido_traducciones)==null?void 0:l.find(U=>U.idioma===f);return{id_catalogo:o.id,id:(C=o.contenido)==null?void 0:C.id,imagen:(w=o.contenido)==null?void 0:w.imagen,tipo:(y=o.contenido)==null?void 0:y.tipo,media_type:(D=o.contenido)==null?void 0:D.media_type,anio:(E=o.contenido)==null?void 0:E.anio,nombre:(t==null?void 0:t.nombre)||((v=o.contenido)==null?void 0:v.nombre)||"Sin título",sinopsis:(t==null?void 0:t.sinopsis)||((F=o.contenido)==null?void 0:F.sinopsis)||"",estado:o.estado||"quiero ver",favorito:o.favorito||!1,puntuacion:o.puntuacion??0}}));h(r),p(r)}catch(a){console.error("Fallo general en cargarCatalogo:",a),u(a)}finally{b(!1)}}})()},[c,f]),n.useEffect(()=>{if(!s||s.length===0){m([]),S([]),_([]);return}m([...new Set(s.map(e=>e.tipo))]),S([...new Set(s.map(e=>e.anio))].sort((e,a)=>a-e)),_([...new Set(s.map(e=>e.estado))])},[s]);function T({tipo:e,anio:a,estado:i,texto:r}){let o=[...s];if(e&&(o=o.filter(t=>t.tipo===e)),a&&(o=o.filter(t=>t.anio===a)),i&&(o=o.filter(t=>t.estado===i)),r&&r.trim()!==""){const t=r.trim().toLowerCase();o=o.filter(d=>{var l;return(l=d.nombre)==null?void 0:l.toLowerCase().includes(t)})}p(o)}return{catalogo:g,catalogoFiltrado:g,setCatalogoFiltrado:p,tiposDisponibles:x,aniosDisponibles:A,estadosDisponibles:N,loading:L,error:q,aplicarFiltros:T}}export{B as u};
