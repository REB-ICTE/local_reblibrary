define(["exports"],(function(t){"use strict";/**
 * Resource web service client.
 * Provides methods to interact with local_reblibrary resource web services.
 *
 * @module local_reblibrary/services/resources
 * @copyright 2025 Rwanda Education Board
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const i={getAll:e=>new Promise((c,a)=>{require(["core/ajax"],l=>{l.call([{methodname:"local_reblibrary_get_all_resources",args:{search_query:e?.searchQuery||"",level_id:e?.levelId||0,sublevel_id:e?.sublevelId||0,class_id:e?.classId||0,category_id:e?.categoryId||0}}])[0].then(r=>c(r)).catch(r=>a(r))})}),getById:e=>new Promise((c,a)=>{require(["core/ajax"],l=>{l.call([{methodname:"local_reblibrary_get_resource_by_id",args:{id:e}}])[0].then(r=>c(r)).catch(r=>a(r))})}),create:e=>new Promise((c,a)=>{require(["core/ajax"],l=>{l.call([{methodname:"local_reblibrary_create_resource",args:{title:e.title,isbn:e.isbn,author_id:e.author_id,description:e.description,cover_image_url:e.cover_image_url,file_url:e.file_url}}])[0].then(r=>c(r)).catch(r=>a(r))})}),update:(e,c)=>new Promise((a,l)=>{require(["core/ajax"],r=>{r.call([{methodname:"local_reblibrary_update_resource",args:{id:e,...c}}])[0].then(o=>a(o)).catch(o=>l(o))})}),delete:e=>new Promise((c,a)=>{require(["core/ajax"],l=>{l.call([{methodname:"local_reblibrary_delete_resource",args:{id:e}}])[0].then(r=>c(r)).catch(r=>a(r))})})};t.ResourceService=i}));
//# sourceMappingURL=resources-BlUgWxBT.js.map
