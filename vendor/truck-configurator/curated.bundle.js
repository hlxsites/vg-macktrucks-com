"use strict";(self.webpackChunkmack_configurator_web=self.webpackChunkmack_configurator_web||[]).push([[502],{"./src/components/App/style.scss":(e,t,n)=>{n.r(t)},"./src/pages/CuratedChoices/CustomTruckSection/CustomTruckSlide/style.module.scss":(e,t,n)=>{n.r(t),n.d(t,{default:()=>a});const a={container:"YgixE0hvR00ANE7ZwlIC",mainContent:"dMx4PKBotNBNksX7CkgA",driverGallery:"noh0Bm107uRni3E71azE",leftText:"YntvZcSqbPdVjeRspiRF",desc:"NG8mcPA8TMHhWrvYIifg",subtitle:"fskNRKYps5FEEh1BMas5"}},"./src/pages/CuratedChoices/CustomTruckSection/TruckDetails/style.module.scss":(e,t,n)=>{n.r(t),n.d(t,{default:()=>a});const a={container:"QDuYhsixAg7cEiPBdYo6",specificationsWrapper:"ufzxsELHOnt0iX2jgWWW",image:"SZmYpAq4ZAoWAKH3JLGd","fade-in":"us19ebjiBZzrwS2bCtmC",specifications:"c7QaaKk4WSfrhR3HrmUF",specLabel:"BsTEkyalb_U1j5DE6Ryi",specValue:"prlgmrLonmIdZ6YqxLIn",link:"CEY6LNeZ9PqZgyJKEA2x"}},"./src/pages/CuratedChoices/style.module.scss":(e,t,n)=>{n.r(t),n.d(t,{default:()=>a});const a={scrollView:"R0n_dYi980EUxacArzVt",container:"gPr8IhjVnMHeGGzCLrvS",overview:"YR_rZoDs2iRs5ffv6hTA",underline:"cn2_iYD5KQsuTbvzmn_a",tabsWrapper:"SDoAdWGt6fvRatYohJF1",tabs:"SCHLpKzNDTL8CcR0Mpob",heroImage:"pP259B5k6kgOkx4XY6cg"}},"./src/clients/OneApplication/index.ts":(e,t)=>{var n,a;Object.defineProperty(t,"__esModule",{value:!0}),t.getAppData=t.getLocales=void 0;var r=null!==(n="https://mack-trucks-one-application.onecx.cloud/api/v1")?n:"",c=null!==(a="gxg5XVNXypLhm23Ir2xQrEuMhGcKZU1ywYoyqrX8")?a:"",i=null!=="4"?"4":"",o="MISSING_ENV_VAR".APPLICATION_VERSION,s=new Headers;s.append("X-Header-AppId",i),s.append("X-Header-ApiKey",c),o&&s.append("X-Header-versionId",o),s.append("Content-Type","application/json");t.getLocales=function(){return fetch("".concat(r,"/locales"),{headers:s,method:"GET"}).then((function(e){return e.ok?e.json():Promise.reject(new Error("GetLocales request failed: ".concat(e.statusText)))}))};t.getAppData=function(e){return fetch("".concat(r,"/applications/locale/").concat(e),{headers:s,method:"GET"}).then((function(e){return e.ok?e.json():Promise.reject(new Error("GetAppData request failed: ".concat(e.statusText)))}))}},"./src/clients/OneProduct/index.ts":(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.getCachedJson=t.getAllProducts=t.getProduct=void 0;var n="https://mack-trucks-one-product.onecx.cloud/api/v1/products",a=new Headers;a.append("X-Header-AppId","4"),a.append("X-Header-ApiKey","gxg5XVNXypLhm23Ir2xQrEuMhGcKZU1ywYoyqrX8"),a.append("Content-Type","application/json");t.getProduct=function(e,t){return fetch("".concat(n,"/").concat(e,"/data/").concat(t),{headers:a,method:"GET"}).then((function(e){return e.ok?e.json():Promise.reject(new Error("GetProduct request failed: ".concat(e.statusText)))}))};t.getAllProducts=function(e){return fetch("".concat(n,"/data/").concat(e,"?ignoreComponents=true"),{headers:a,method:"GET"}).then((function(e){return e.ok?e.json():Promise.reject(new Error("GetAllProducts request failed: ".concat(e.statusText)))}))};t.getCachedJson=function(e){return fetch(e,{headers:a,method:"GET"}).then((function(e){return e.ok?e.json():Promise.reject(new Error("Failed to fetch cached JSON!"))}))}},"./src/components/App/index.tsx":function(e,t,n){var a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=a(n("./node_modules/react/index.js"));n("./src/components/App/style.scss");var c=n("./node_modules/mack-component-library/lib/esm/index.js"),i=a(n("./src/contexts/PageDataContext/index.tsx")),o=a(n("./src/pages/CuratedChoices/index.tsx"));t.default=function(){return r.default.createElement(i.default,null,r.default.createElement(c.MediaQueryContext,null,r.default.createElement(o.default,null)))}},"./src/contexts/PageDataContext/index.tsx":function(e,t,n){var a=this&&this.__assign||function(){return a=Object.assign||function(e){for(var t,n=1,a=arguments.length;n<a;n++)for(var r in t=arguments[n])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e},a.apply(this,arguments)},r=this&&this.__createBinding||(Object.create?function(e,t,n,a){void 0===a&&(a=n);var r=Object.getOwnPropertyDescriptor(t,n);r&&!("get"in r?!t.__esModule:r.writable||r.configurable)||(r={enumerable:!0,get:function(){return t[n]}}),Object.defineProperty(e,a,r)}:function(e,t,n,a){void 0===a&&(a=n),e[a]=t[n]}),c=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)"default"!==n&&Object.prototype.hasOwnProperty.call(e,n)&&r(t,e,n);return c(t,e),t};Object.defineProperty(t,"__esModule",{value:!0}),t.usePageData=void 0;var o=i(n("./node_modules/react/index.js")),s=n("./src/clients/OneApplication/index.ts"),u=n("./src/clients/OneProduct/index.ts"),l=o.default.createContext({sections:{},sectionName:function(e){return""},sectionLabel:function(e,t){return""},sectionTitle:function(e){return""},sectionKeys:function(e){return{}},sectionsData:function(e){return[]},isLoading:!1,isProductLoaded:{},products:{},hasError:!1});t.usePageData=function(){return o.default.useContext(l)};t.default=function(e){var t=e.children,n=(0,o.useState)({}),r=n[0],c=n[1],i=(0,o.useState)({}),d=i[0],f=i[1],m=(0,o.useState)(!0),p=m[0],h=m[1],v=(0,o.useState)(!0),_=v[0],b=v[1],g=(0,o.useState)(!1),x=g[0],y=g[1],j=(0,o.useState)(!1),E=j[0],C=j[1];(0,o.useEffect)((function(){x||(y(!0),h(!0),(0,u.getAllProducts)("en").then((function(e){if(e.success){var t={};e.data.forEach((function(e){return t[e.name]=e})),f(t),e.data.forEach((function(e){return function(e){e.cached_url&&(0,u.getCachedJson)(e.cached_url).then((function(t){f((function(n){var r;return a(a({},n),((r={})[e.name]=t,r))}))})).catch((function(e){return console.log(e)}))}(e)}))}else C(!0)})).catch((function(e){console.log(e),C(!0)})).finally((function(){h(!1)})),b(!0),(0,s.getAppData)("en").then((function(e){if(e.success){var t={};e.data.sections.forEach((function(e){t[e.section_name]=e})),c(t)}else C(!0)})).catch((function(e){C(!0),console.log(e)})).finally((function(){b(!1)})))}),[x]);var k={};Object.keys(d).forEach((function(e){var t;return k[e]=!!(null===(t=d[e])||void 0===t?void 0:t.cached_url)}));var P=(0,o.useMemo)((function(){return{sections:r,sectionName:function(e){var t;return(null===(t=r[e])||void 0===t?void 0:t.section_name_localized)||""},sectionLabel:function(e,t){var n;return(null===(n=r[e])||void 0===n?void 0:n.key_values[t])||""},sectionTitle:function(e){var t;return(null===(t=r[e])||void 0===t?void 0:t.section_name_localized)||""},sectionKeys:function(e){var t;return(null===(t=r[e])||void 0===t?void 0:t.key_values)||""},sectionsData:function(e){return Object.keys(r).filter((function(t){return t.startsWith(e)})).map((function(e){return r[e].key_values}))},isLoading:_||p,isProductLoaded:k,products:d,hasError:E}}),[r,_,p,E,d]);return o.default.createElement(l.Provider,{value:P},t)}},"./src/index.tsx":function(e,t,n){var a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),n("./node_modules/mack-component-library/lib/esm/index.css");var r=a(n("./node_modules/react/index.js")),c=a(n("./node_modules/react-dom/client.js")),i=a(n("./src/components/App/index.tsx"));c.default.createRoot(document.getElementById("curated-choices")).render(r.default.createElement(r.default.StrictMode,null,r.default.createElement(i.default,null)))},"./src/pages/CuratedChoices/CustomTruckSection/CustomTruckSlide/index.tsx":function(e,t,n){var a=this&&this.__createBinding||(Object.create?function(e,t,n,a){void 0===a&&(a=n);var r=Object.getOwnPropertyDescriptor(t,n);r&&!("get"in r?!t.__esModule:r.writable||r.configurable)||(r={enumerable:!0,get:function(){return t[n]}}),Object.defineProperty(e,a,r)}:function(e,t,n,a){void 0===a&&(a=n),e[a]=t[n]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),c=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)"default"!==n&&Object.prototype.hasOwnProperty.call(e,n)&&a(t,e,n);return r(t,e),t},i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var o=c(n("./node_modules/react/index.js")),s=i(n("./src/pages/CuratedChoices/CustomTruckSection/CustomTruckSlide/style.module.scss")),u=n("./node_modules/mack-component-library/lib/esm/index.js"),l=i(n("./src/pages/CuratedChoices/CustomTruckSection/TruckDetails/index.tsx")),d=n("./src/contexts/PageDataContext/index.tsx");t.default=(0,o.forwardRef)((function(e,t){var n=e.subtitle,a=e.title,r=e.text,c=e.image,i=e.detailSection,f=e.activeIndex,m=e.onNext,p=e.onPrev,h=(0,u.useMediaQuery)().matchedDevice,v=(0,d.usePageData)().sectionLabel,_=h.includes("mobile"),b=v("curated_choices_page","build_button_label");return o.default.createElement("div",{className:s.default.container,ref:t},o.default.createElement("div",{className:s.default.mainContent},o.default.createElement("div",{className:s.default.leftText},o.default.createElement(u.Text,{className:s.default.subtitle,type:u.TextType.Accent1},n),o.default.createElement(u.Title,{className:s.default.title,as:_?"h4":"h1"},a)),r&&o.default.createElement(u.RichText,{className:s.default.desc,value:r})),o.default.createElement("div",{className:s.default.driverGallery},o.default.createElement(u.DriverGallery,{image:c,index:f,onNext:m,onPrev:p})),o.default.createElement(l.default,{specifications:i.specifications,image:i.image,buttonLink:i.buttonLink,buttonLabel:b,page:f}))}))},"./src/pages/CuratedChoices/CustomTruckSection/TruckDetails/index.tsx":function(e,t,n){var a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=a(n("./node_modules/react/index.js")),c=a(n("./src/pages/CuratedChoices/CustomTruckSection/TruckDetails/style.module.scss")),i=n("./node_modules/mack-component-library/lib/esm/index.js"),o=n("./node_modules/framer-motion/dist/cjs/index.js"),s={hidden:{opacity:0},visible:{opacity:1}};t.default=function(e){var t=e.specifications,n=e.image,a=e.buttonLink,u=e.buttonLabel,l=e.page;return r.default.createElement("div",{className:c.default.container},r.default.createElement("div",{className:c.default.specificationsWrapper},r.default.createElement(o.AnimatePresence,{mode:"wait"},r.default.createElement(o.motion.div,{className:c.default.specifications,variants:s,initial:"hidden",animate:"visible",exit:"hidden",transition:{duration:.2},key:l},t.map((function(e,t){return r.default.createElement("div",{key:"specification-item-".concat(e.value)},r.default.createElement(i.Text,{type:i.TextType.Accent1,className:c.default.specLabel},null==e?void 0:e.label),r.default.createElement(i.Text,{type:i.TextType.Accent1,className:c.default.specValue},null==e?void 0:e.value))})))),r.default.createElement("a",{href:a,target:"blank",className:c.default.link},r.default.createElement(i.Button,{variant:i.ButtonVariant.Primary,label:u,iconAlignment:i.Alignments.Left}))),r.default.createElement(i.Image,{src:n,className:c.default.image,fit:i.ImageFit.Contain}))}},"./src/pages/CuratedChoices/CustomTruckSection/index.tsx":function(e,t,n){var a=this&&this.__assign||function(){return a=Object.assign||function(e){for(var t,n=1,a=arguments.length;n<a;n++)for(var r in t=arguments[n])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e},a.apply(this,arguments)},r=this&&this.__createBinding||(Object.create?function(e,t,n,a){void 0===a&&(a=n);var r=Object.getOwnPropertyDescriptor(t,n);r&&!("get"in r?!t.__esModule:r.writable||r.configurable)||(r={enumerable:!0,get:function(){return t[n]}}),Object.defineProperty(e,a,r)}:function(e,t,n,a){void 0===a&&(a=n),e[a]=t[n]}),c=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)"default"!==n&&Object.prototype.hasOwnProperty.call(e,n)&&r(t,e,n);return c(t,e),t},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var s=i(n("./node_modules/react/index.js")),u=n("./node_modules/framer-motion/dist/cjs/index.js"),l=o(n("./src/pages/CuratedChoices/CustomTruckSection/CustomTruckSlide/index.tsx"));t.default=function(e){var t=e.sections,n=e.index,r=e.sectionRefs,c=(0,s.useState)(0),i=c[0],o=c[1],d=function(e){o((0,u.wrap)(0,t.length,i+e))},f=t[i];return s.default.createElement("article",null,f&&s.default.createElement(l.default,a({ref:function(e){r.current[n]=e}},f,{activeIndex:i+1,onNext:function(){return d(1)},onPrev:function(){return d(-1)}})))}},"./src/pages/CuratedChoices/index.tpl.tsx":function(e,t,n){var a=this&&this.__createBinding||(Object.create?function(e,t,n,a){void 0===a&&(a=n);var r=Object.getOwnPropertyDescriptor(t,n);r&&!("get"in r?!t.__esModule:r.writable||r.configurable)||(r={enumerable:!0,get:function(){return t[n]}}),Object.defineProperty(e,a,r)}:function(e,t,n,a){void 0===a&&(a=n),e[a]=t[n]}),r=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),c=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)"default"!==n&&Object.prototype.hasOwnProperty.call(e,n)&&a(t,e,n);return r(t,e),t},i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var o=c(n("./node_modules/react/index.js")),s=i(n("./src/pages/CuratedChoices/style.module.scss")),u=n("./node_modules/mack-component-library/lib/esm/index.js"),l=i(n("./src/pages/CuratedChoices/CustomTruckSection/index.tsx"));t.default=function(e){var t=e.title,n=e.body,a=e.sectionTabs,r=e.heroImage,c=e.sections,i=(0,u.useMediaQuery)().matchedDevice.includes("mobile"),d=(0,o.useRef)([]),f=(0,o.useRef)(null);return o.default.createElement("div",{className:s.default.scrollView,ref:f},o.default.createElement("div",{className:s.default.container},o.default.createElement("div",{className:s.default.overview},o.default.createElement("div",{className:s.default.underline}),o.default.createElement(u.Title,{as:i?"h2":"h1"},t),o.default.createElement(u.RichText,{as:"p",value:n})),o.default.createElement("div",{className:s.default.tabsWrapper},o.default.createElement(u.SectionTabs,{tabs:a,className:s.default.tabs,onSelected:function(e){var t,n=a.findIndex((function(t){return t.value===e}));d.current[n]&&(null===(t=d.current[n])||void 0===t||t.scrollIntoView({behavior:"smooth"}))}})),o.default.createElement(u.Image,{src:r,className:s.default.heroImage}),o.default.createElement("div",{className:s.default.sections},c.map((function(e,t){return o.default.createElement(l.default,{key:"section-slide-".concat(t),sectionRefs:d,sections:e,index:t})})))))}},"./src/pages/CuratedChoices/index.tsx":function(e,t,n){var a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=a(n("./node_modules/react/index.js")),c=a(n("./src/pages/CuratedChoices/index.tpl.tsx")),i=n("./node_modules/mack-component-library/lib/esm/index.js"),o=n("./src/contexts/PageDataContext/index.tsx");t.default=function(){for(var e=(0,o.usePageData)(),t=e.sectionLabel,n=e.sectionsData,a=[],s=1;;){var u=t("truck_tabs","label_".concat(s)),l=t("truck_tabs","value_".concat(s)),d=null;if(3===s&&(d=r.default.createElement(i.Icon,{icon:i.Icons.flash})),!u&&!l)break;var f={label:u,value:l,widget:d};a.push(f),s++}var m=a.map((function(e){return n("".concat(e.value,".")).map((function(e){for(var t=[],n=1;;){var a="details_label_".concat(n),r="details_value_".concat(n);if(!e[a]||!e[r])break;t.push({label:e[a],value:e[r]}),n++}var c=e.truck_config;return{title:e.title,subtitle:e.subtitle,text:e.text,image:e.gallery_image_url,detailSection:{specifications:t,image:e.details_image_url,buttonLink:c}}}))})).filter((function(e){return e.length>0}));return r.default.createElement(c.default,{title:t("curated_choices_page","title"),body:t("curated_choices_page","text"),sectionTabs:a,heroImage:t("curated_choices_page","hero_image"),sections:m})}}},e=>{e.O(0,[147],(()=>{return t="./src/index.tsx",e(e.s=t);var t}));e.O()}]);
//# sourceMappingURL=curated.bundle.js.map