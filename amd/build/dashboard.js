define(["exports","./assets/styles-B-QKMb-0","./assets/library-menu-CSGd4r3Y"],(function(d,e,m){"use strict";function c({icon:r,number:a,label:o}){return e.u("div",{className:"bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center",children:[e.u("div",{className:"text-4xl text-reb-blue mb-4",children:e.u("i",{className:r})}),e.u("h3",{className:"text-3xl font-bold text-reb-blue mb-2",children:a}),e.u("p",{className:"text-sm text-gray-600",children:o})]})}/**
 * Resource web service client.
 * Provides methods to interact with local_reblibrary resource web services.
 *
 * @module local_reblibrary/services/resources
 * @copyright 2025 Rwanda Education Board
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const b={getAll:()=>new Promise((r,a)=>{require(["core/ajax"],o=>{o.call([{methodname:"local_reblibrary_get_all_resources",args:{}}])[0].then(l=>r(l)).catch(l=>a(l))})}),getById:r=>new Promise((a,o)=>{require(["core/ajax"],l=>{l.call([{methodname:"local_reblibrary_get_resource_by_id",args:{id:r}}])[0].then(t=>a(t)).catch(t=>o(t))})}),create:r=>new Promise((a,o)=>{require(["core/ajax"],l=>{l.call([{methodname:"local_reblibrary_create_resource",args:{title:r.title,isbn:r.isbn,author_id:r.author_id,description:r.description,cover_image_url:r.cover_image_url,file_url:r.file_url}}])[0].then(t=>a(t)).catch(t=>o(t))})}),update:(r,a)=>new Promise((o,l)=>{require(["core/ajax"],t=>{t.call([{methodname:"local_reblibrary_update_resource",args:{id:r,...a}}])[0].then(s=>o(s)).catch(s=>l(s))})}),delete:r=>new Promise((a,o)=>{require(["core/ajax"],l=>{l.call([{methodname:"local_reblibrary_delete_resource",args:{id:r}}])[0].then(t=>a(t)).catch(t=>o(t))})})};/**
 * Global state management using Preact signals.
 *
 * @package    local_reblibrary
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const g=e.d$1({id:0,fullname:"Guest",firstname:"Guest",lastname:"",email:"",avatar:"",roles:["guest"]}),n=e.d$1({totalResources:0,totalAuthors:0,totalCategories:0,totalClasses:0}),h=e.d$1([]),i=e.d$1(!1),u=e.d$1(null);/**
 * Resource store actions.
 * Functions to load and manipulate resources, updating Preact signals.
 *
 * @module local_reblibrary/services/resource-store
 * @copyright 2025 Rwanda Education Board
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const v=async()=>{i.value=!0,u.value=null;try{const r=await b.getAll();h.value=r,n.value={...n.value,totalResources:r.length},console.log("Resources loaded:",r.length)}catch(r){const a=r?.message||"Failed to load resources";u.value=a,console.error("Error loading resources:",r)}finally{i.value=!1}};function f({stats:r}){return e.y(()=>{v()},[]),e.u("section",{className:"p-8",children:[e.u("h2",{className:"text-2xl font-semibold text-gray-800 mb-6",children:"Dashboard Overview"}),u.value&&e.u("div",{className:"bg-red-50 border border-red-200 rounded-lg p-4 mb-6",children:[e.u("h5",{className:"text-lg font-semibold text-red-800 mb-2",children:"Error"}),e.u("p",{className:"text-red-700",children:u.value})]}),e.u("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6",children:[e.u(c,{icon:"fa fa-book",number:n.value.totalResources,label:"Total Resources"}),e.u(c,{icon:"fa fa-user-edit",number:n.value.totalAuthors,label:"Authors"}),e.u(c,{icon:"fa fa-tags",number:n.value.totalCategories,label:"Categories"}),e.u(c,{icon:"fa fa-graduation-cap",number:n.value.totalClasses,label:"Classes"})]}),i.value&&e.u("div",{className:"bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6",children:e.u("p",{className:"text-gray-700",children:"Loading resources..."})}),e.u("div",{className:"bg-reb-blue-50 border border-reb-blue-200 rounded-lg p-4",children:[e.u("h5",{className:"text-lg font-semibold text-reb-blue-800 mb-2",children:"Welcome to REB Library Administration"}),e.u("p",{className:"text-reb-blue-700",children:"Use the sidebar menu to manage education structure, resources, categories, and assignments."})]})]})}function _(){const r=m.getAdminMenuItems("dashboard"),a=m.getLibraryMenuItems();return e.u("div",{className:"flex min-h-screen bg-white",children:[e.u(e.Sidebar,{adminMenuItems:r,libraryMenuItems:a}),e.u("main",{className:"flex-1 overflow-y-auto",children:e.u(f,{stats:n.value})})]})}/**
 * Example REB Library module with Preact integration.
 *
 * @module     local_reblibrary/example-with-preact
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const x=(r="#reb-library-root")=>{const a=document.querySelector(r);if(!a){console.error(`Container not found: ${r}`);return}try{const o=a.getAttribute("data-user"),l=a.getAttribute("data-stats");if(o){const t=JSON.parse(o);g.value=t,console.log("User data loaded:",t)}if(l){const t=JSON.parse(l);n.value=t,console.log("Stats data loaded:",t)}}catch(o){console.error("Error parsing data attributes:",o)}e.G(e._(_,null),a)};d.init=x,Object.defineProperty(d,Symbol.toStringTag,{value:"Module"})}));
//# sourceMappingURL=dashboard.js.map
