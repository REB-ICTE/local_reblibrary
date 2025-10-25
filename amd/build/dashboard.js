define(["exports","./assets/styles-D3pLwOAB","./assets/resources-DcBbVI18","./assets/signals.module-DigZoAFr","./assets/library-menu-CSGd4r3Y"],(function(i,e,m,s,d){"use strict";function l({icon:a,number:r,label:o}){return e.u("div",{className:"bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center",children:[e.u("div",{className:"text-4xl text-reb-blue mb-4",children:e.u("i",{className:a})}),e.u("h3",{className:"text-3xl font-bold text-reb-blue mb-2",children:r}),e.u("p",{className:"text-sm text-gray-600",children:o})]})}/**
 * Global state management using Preact signals.
 *
 * @package    local_reblibrary
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const g=s.d({id:0,fullname:"Guest",firstname:"Guest",lastname:"",email:"",avatar:"",roles:["guest"]}),t=s.d({totalResources:0,totalAuthors:0,totalCategories:0,totalClasses:0}),h=s.d([]),c=s.d(!1),u=s.d(null);/**
 * Resource store actions.
 * Functions to load and manipulate resources, updating Preact signals.
 *
 * @module local_reblibrary/services/resource-store
 * @copyright 2025 Rwanda Education Board
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const v=async()=>{c.value=!0,u.value=null;try{const a=await m.ResourceService.getAll();h.value=a,t.value={...t.value,totalResources:a.length},console.log("Resources loaded:",a.length)}catch(a){const r=a?.message||"Failed to load resources";u.value=r,console.error("Error loading resources:",a)}finally{c.value=!1}};function f({stats:a}){return e.y(()=>{v()},[]),e.u("section",{className:"p-8",children:[e.u("h2",{className:"text-2xl font-semibold text-gray-800 mb-6",children:"Dashboard Overview"}),u.value&&e.u("div",{className:"bg-red-50 border border-red-200 rounded-lg p-4 mb-6",children:[e.u("h5",{className:"text-lg font-semibold text-red-800 mb-2",children:"Error"}),e.u("p",{className:"text-red-700",children:u.value})]}),e.u("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6",children:[e.u(l,{icon:"fa fa-book",number:t.value.totalResources,label:"Total Resources"}),e.u(l,{icon:"fa fa-user-edit",number:t.value.totalAuthors,label:"Authors"}),e.u(l,{icon:"fa fa-tags",number:t.value.totalCategories,label:"Categories"}),e.u(l,{icon:"fa fa-graduation-cap",number:t.value.totalClasses,label:"Classes"})]}),c.value&&e.u("div",{className:"bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6",children:e.u("p",{className:"text-gray-700",children:"Loading resources..."})}),e.u("div",{className:"bg-reb-blue-50 border border-reb-blue-200 rounded-lg p-4",children:[e.u("h5",{className:"text-lg font-semibold text-reb-blue-800 mb-2",children:"Welcome to REB Library Administration"}),e.u("p",{className:"text-reb-blue-700",children:"Use the sidebar menu to manage education structure, resources, categories, and assignments."})]})]})}function x(){const a=d.getAdminMenuItems("dashboard"),r=d.getLibraryMenuItems();return e.u("div",{className:"flex min-h-screen bg-white",children:[e.u(e.Sidebar,{adminMenuItems:a,libraryMenuItems:r}),e.u("main",{className:"flex-1 overflow-y-auto",children:e.u(f,{stats:t.value})})]})}/**
 * Example REB Library module with Preact integration.
 *
 * @module     local_reblibrary/example-with-preact
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const N=(a="#reb-library-root")=>{const r=document.querySelector(a);if(!r){console.error(`Container not found: ${a}`);return}try{const o=r.getAttribute("data-user"),b=r.getAttribute("data-stats");if(o){const n=JSON.parse(o);g.value=n,console.log("User data loaded:",n)}if(b){const n=JSON.parse(b);t.value=n,console.log("Stats data loaded:",n)}}catch(o){console.error("Error parsing data attributes:",o)}e.G(e._(x,null),r)};i.init=N,Object.defineProperty(i,Symbol.toStringTag,{value:"Module"})}));
//# sourceMappingURL=dashboard.js.map
