import{j as a}from"./index-B5isPGjJ.js";import{M as l}from"./MediaCard-C2rwDOJ9.js";import"./index-CAHzaGJp.js";import"./Navbar-CKa8b93H.js";import"./useUsuario-ByIR5A8c.js";function p({catalogo:r,className:i=""}){return Array.isArray(r)?a.jsx("div",{className:`
        flex flex-nowrap overflow-x-auto gap-4 items-start
        scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 m-auto
        sm:overflow-x-auto sm:flex-nowrap
        lg:grid-cols-5
        ${i}
      `,children:r.map(o=>a.jsx(l,{nombre:o.nombre,imagen:o.imagen,anio:o.anio,tipo:o.tipo,media_type:o.media_type,favorito:o.favorito,viendo:o.estado==="viendo",conProximos:o.conProximos,proximoEpisodio:o.proximoEpisodio,onVerDetalle:()=>window.location.href=`/#/detalle/${o.media_type}/${o.id}`},o.id_catalogo||o.id))}):null}export{p as default};
