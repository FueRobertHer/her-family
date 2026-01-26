console.log("=== Edit Mode Toggle Script Loading ===");let u=null,b={},x={},S=!1,f=null;function v(e){const t=document.body,o=document.querySelectorAll('[class*="border-dashed"]');e?(t.classList.remove("hide-edit-buttons"),o.forEach(i=>{i.classList.add("opacity-60","opacity-70","border-2","border-dashed");const a=i.querySelector(".hidden-badge");a&&(a.style.display="block")}),console.log("✅ Edit mode: ON - showing buttons and hidden sections")):(t.classList.add("hide-edit-buttons"),o.forEach(i=>{(i.classList.contains("opacity-60")||i.classList.contains("opacity-70"))&&(i.classList.add("hidden-in-preview"),i.style.display="none")}),console.log("❌ Edit mode: OFF - hiding buttons and hidden sections"))}function E(){document.querySelectorAll(".hidden-in-preview").forEach(t=>{t.style.display="",t.classList.remove("hidden-in-preview")})}function $(){if(S)return!0;try{const e=document.getElementById("memorial-data");return e?(x=JSON.parse(e.textContent),S=!0,console.log("Memorial data loaded:",x),!0):(console.error("Memorial data script not found"),!1)}catch(e){return console.error("Failed to parse memorial data:",e),!1}}function y(e,t){const o=document.createElement("div");o.className=`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${t==="success"?"bg-green-500":"bg-red-500"}`,o.textContent=e,document.body.appendChild(o),setTimeout(()=>{o.remove()},3e3)}function I(e){const t=document.getElementById("hero-section");if(t){if(e.name){const o=t.querySelector("[data-hero-name]");o&&(o.textContent=e.name);const i=document.querySelector("footer h3");i&&(i.textContent=e.name),document.title=`${e.name} - Memorial Page`}if(e.subtitle){const o=t.querySelector("[data-hero-subtitle]");o&&(o.textContent=e.subtitle)}if(e.birthDate||e.deathDate){const o=e.birthDate||b.hero?.birthDate?.value,i=e.deathDate||b.hero?.deathDate?.value,a=t.querySelector("[data-hero-dates]");if(a&&o&&i){const r=new Date(o).getFullYear(),s=new Date(i).getFullYear();a.innerHTML=`<time datetime="${o}">${r}</time><span class="w-8 h-px bg-warm-gray-400"></span><time datetime="${i}">${s}</time>`;const n=document.querySelector("footer p.text-warm-gray-400");n&&(n.textContent=`${r} - ${s}`)}}if(e.mainImage&&(t.querySelectorAll("[data-hero-image], img[data-hero-image]").forEach(i=>{i.src=e.mainImage}),!e.backgroundImage&&!b.hero?.backgroundImage?.value)){const i=t.querySelector("[data-hero-background]");i&&(i.src=e.mainImage)}if(e.backgroundImage){const o=t.querySelector("[data-hero-background]");o&&(o.src=e.backgroundImage)}}}function C(e){const t=document.getElementById("biography-section");if(t){if(e.visible!==void 0&&m(t,e.visible),e.title){const o=t.querySelector("[data-bio-title]");o&&(o.textContent=e.title)}if(e.content){const o=t.querySelector("[data-bio-content]");if(o){const i=e.content.split(`

`).filter(a=>a.trim());o.innerHTML=i.map(a=>`<p class="mb-6">${a}</p>`).join("")}}}}function T(e){const t=document.getElementById("biography-section");if(!t)return;const o=t.querySelector("[data-bio-highlights]")?.closest(".mt-12");if(o&&e.visible!==void 0&&(m(o,e.visible),o.style.display="block"),e.highlights){const i=t.querySelector("[data-bio-highlights]");if(i){const a=e.highlights.split(`
`).filter(r=>r.trim());i.innerHTML=a.map(r=>`
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 w-2 h-2 bg-warm-gray-400 rounded-full mt-3"></div>
          <p class="text-warm-gray-700">${r.trim()}</p>
        </div>
      `).join("")}}}function q(e){const t=document.getElementById("video-section");if(t){if(e.visible!==void 0&&m(t,e.visible),e.sectionTitle){const o=t.querySelector("[data-video-title]");o&&(o.textContent=e.sectionTitle)}if(e.description){const o=t.querySelector("[data-video-description]");o&&(o.textContent=e.description)}if(e.videoUrl){const o=t.querySelector("[data-video-source]"),i=t.querySelector("[data-video-element]");o&&i&&(o.src=e.videoUrl,i.load())}if(e.posterImage){const o=t.querySelector("[data-video-element]");o&&(o.poster=e.posterImage)}}}function M(e){const t=document.getElementById("donations-section");if(!t)return;if(e.venmoImage!==void 0||e.cashappImage!==void 0||e.zelleImage!==void 0){setTimeout(()=>{window.location.reload()},500);return}if(e.visible!==void 0&&m(t,e.visible),e.sectionTitle){const i=t.querySelector("[data-donations-title]");i&&(i.textContent=e.sectionTitle)}if(e.subtitle){const i=t.querySelector("[data-donations-subtitle]");i&&(i.textContent=e.subtitle)}if(e.customMessage){const i=t.querySelector("[data-donation-message]");i&&(i.textContent=e.customMessage)}const o=(i,a,r,s,n,d)=>{if(e[i]!==void 0){const l=t.querySelector(a),c=t.querySelector(r),g=s?t.querySelector(s):null,p=e[i];l&&(p?l.classList.remove("hidden"):l.classList.add("hidden")),c&&(c.textContent=n(p)),g&&p&&(g.href=d(p))}};o("venmoUsername","[data-venmo-container]","[data-venmo-username]","[data-venmo-link]",i=>`@${i}`,i=>`https://venmo.com/${i}`),o("cashappUsername","[data-cashapp-container]","[data-cashapp-username]","[data-cashapp-link]",i=>`${i}`,i=>`https://cash.app/${i}`),o("zelleEmail","[data-zelle-container]","[data-zelle-email]",null,i=>i,i=>"#")}function L(e){const t=document.getElementById("funeral-section");if(t){if(e.visible!==void 0&&m(t,e.visible),e.sectionTitle){const o=t.querySelector("[data-funeral-title]");o&&(o.textContent=e.sectionTitle)}if(e.subtitle){const o=t.querySelector("[data-funeral-subtitle]");o&&(o.textContent=e.subtitle)}}}function B(e){const t=document.getElementById("special-instructions-section");if(t&&(e.specialInstructionsVisible!==void 0&&m(t,e.specialInstructionsVisible),e.specialInstructions)){const o=t.querySelector("[data-funeral-instructions]");o&&(o.textContent=e.specialInstructions)}}function F(e){const t=document.getElementById("flowers-info-section");if(t&&(e.flowersInfoVisible!==void 0&&m(t,e.flowersInfoVisible),e.flowersInfo)){const o=t.querySelector("[data-funeral-flowers]");o&&(o.textContent=e.flowersInfo)}}function D(e,t){console.log(`Updating service ${e} on page with:`,t);const o=document.querySelector(`[data-service-index="${e}"]`);if(!o){console.error(`Service card not found for index ${e}`);return}const i=r=>r?new Date(r).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}):"",a=r=>{if(!r)return"";const[s,n]=r.split(":"),d=parseInt(s),l=d>=12?"PM":"AM";return`${d%12||12}:${n} ${l}`};if(t.type){const r=o.querySelector(`[data-service-type="${e}"]`);r&&(r.textContent=t.type)}if(t.date!==void 0){const r=o.querySelector(`[data-service-date="${e}"]`);if(r){let s=i(t.date);if(t.endDate&&t.endDate!==t.date){const n=r.querySelector(`[data-service-endDate="${e}"]`);n?n.textContent=i(t.endDate):s+=` - ${i(t.endDate)}`}r.querySelector(`[data-service-endDate="${e}"]`)||(r.textContent=s)}}if(t.time!==void 0){const r=o.querySelector(`[data-service-time="${e}"]`);if(r){let s=a(t.time);if(t.endTime){const n=r.querySelector(`[data-service-endTime="${e}"]`);n?n.textContent=a(t.endTime):s+=` - ${a(t.endTime)}`}r.querySelector(`[data-service-endTime="${e}"]`)||(r.textContent=s)}}if(t.location){if(t.location.name){const r=o.querySelector(`[data-service-location-name="${e}"]`);r&&(r.textContent=t.location.name)}if(t.location.address){const r=o.querySelector(`[data-service-location-address="${e}"]`);r&&(r.textContent=t.location.address)}if(t.location.phone!==void 0){const r=o.querySelector(`[data-service-location-phone="${e}"]`);r&&(r.textContent=t.location.phone,r.href=`tel:${t.location.phone}`)}if(t.location.website!==void 0){const r=o.querySelector(`[data-service-location-website="${e}"]`);r&&(r.href=t.location.website)}}if(t.description!==void 0){const r=o.querySelector(`[data-service-description="${e}"]`);r&&(r.textContent=t.description)}if(t.dresscode!==void 0){const r=o.querySelector(`[data-service-dresscode="${e}"]`);r&&(r.textContent=t.dresscode)}console.log(`Service ${e} updated successfully on page`)}function U(e){const t=document.getElementById("gallery-section");if(t){if(e.visible!==void 0&&m(t,e.visible),e.sectionTitle){const o=t.querySelector("[data-gallery-title]");o&&(o.textContent=e.sectionTitle)}y("Gallery updated successfully.","success")}}function A(e){const t=document.getElementById("comments-section");if(t){if(e.visible!==void 0&&m(t,e.visible),e.sectionTitle){const o=t.querySelector("[data-comments-title]");o&&(o.textContent=e.sectionTitle)}if(e.subtitle){const o=t.querySelector("[data-comments-subtitle]");o&&(o.textContent=e.subtitle)}}}function O(e){const t=document.querySelector("footer");if(t){if(e.visible!==void 0&&m(t,e.visible,!0),e.quote){const o=document.querySelector("[data-footer-quote]");o&&(o.textContent=e.quote)}if(e.credit){const o=document.querySelector("[data-footer-credit]");o&&(o.textContent=e.credit)}}}function P(e){const t=document.getElementById("reception-section");if(t){if(e.visible!==void 0&&m(t,e.visible,!0),e.location){const o=t.querySelector("[data-reception-location]");o&&(o.textContent=e.location)}if(e.time){const o=t.querySelector("[data-reception-time]");o&&(o.textContent=e.time)}if(e.description){const o=t.querySelector("[data-reception-description]");if(o)o.textContent=e.description;else{const i=t.querySelector("[data-reception-content]");if(i){const a=document.createElement("p");a.className="text-warm-gray-300 mt-4 max-w-2xl mx-auto",a.setAttribute("data-reception-description",""),a.textContent=e.description,i.appendChild(a)}}}}}function m(e,t,o=!1){if(!e)return;if(t===!1||t==="false"){if(o?e.classList.add("opacity-60","border-2","border-dashed","border-warm-gray-600"):e.classList.add("opacity-70","border-2","border-dashed","border-gray-300"),!e.querySelector(".hidden-badge")&&e.style.position!=="static"){const a=document.createElement("div");o?a.className="hidden-badge absolute top-0 left-0 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-br z-20":a.className="hidden-badge absolute top-0 left-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-br z-20",a.textContent="Hidden from public",e.prepend(a)}}else{o?e.classList.remove("opacity-60","border-2","border-dashed","border-warm-gray-600"):e.classList.remove("opacity-70","border-2","border-dashed","border-gray-300");const a=e.querySelector(".hidden-badge");a&&a.remove()}}function V(e,t){if(t)switch(e){case"hero":I(t);break;case"biography":C(t);break;case"highlights":T(t);break;case"video":q(t);break;case"donations":M(t);break;case"funeral":L(t);break;case"specialInstructions":B(t);break;case"flowersInfo":F(t);break;case"services":y("Services are arrays. Coming soon!","success");break;case"reception":P(t);break;case"gallery":U(t);break;case"comments":A(t);break;case"footer":O(t);break}}function j(e){f=e.target,f.classList.add("opacity-50"),e.dataTransfer.effectAllowed="move"}function H(e){e.preventDefault(),e.dataTransfer.dropEffect="move";const t=e.target.closest(".reorder-item");t&&t!==f&&t.classList.add("ring-2","ring-blue-500")}function R(e){e.preventDefault();const t=e.target.closest(".reorder-item"),o=document.getElementById("reorderList");if(t&&t!==f&&f&&o){const i=t.parentNode,a=Array.from(o.querySelectorAll(".reorder-item")),r=a.indexOf(f),s=a.indexOf(t);r<s?i.insertBefore(f,t.nextSibling):i.insertBefore(f,t),o.querySelectorAll(".reorder-item").forEach((d,l)=>{d.dataset.index=l.toString();const c=d.querySelector(".bg-black\\/60");c&&(c.textContent=(l+1).toString())})}t?.classList.remove("ring-2","ring-blue-500")}function N(e){f?.classList.remove("opacity-50"),document.querySelectorAll(".reorder-item").forEach(o=>{o.classList.remove("ring-2","ring-blue-500")}),f=null}async function z(e){u=e;const t=document.getElementById("editModal"),o=document.getElementById("modalTitle");S||$();const i={hero:"Edit Hero Section",biography:"Edit Biography",highlights:"Edit Highlights",video:"Edit Video Section",donations:"Edit Donations",funeral:"Edit Funeral Information",specialInstructions:"Edit Special Instructions",flowersInfo:"Edit Flowers/Donation Information",services:"Edit Service Events",reception:"Edit Reception Information",gallery:"Edit Gallery",comments:"Edit Memories",footer:"Edit Footer"};if(e.startsWith("service-")){const a=parseInt(e.split("-")[1]);o.textContent=`Edit Service Event #${a+1}`}else o.textContent=i[e]||"Edit Content";try{const r=await(await fetch("/api/admin/content")).json();r.success?(b=r.data,J(e),t.classList.remove("hidden")):alert("Error loading content: "+r.error)}catch(a){console.error("Error loading content:",a),alert("Error loading content. Please try again.")}}function h(){document.getElementById("editModal").classList.add("hidden"),u=null}function J(e){const t=document.getElementById("modalContent");if(b[e],e.startsWith("service-")){const n=parseInt(e.split("-")[1]),l=(x.funeralInfo?.services||[])[n];if(!l){t.innerHTML='<div class="text-red-600">Service not found</div>';return}t.innerHTML=`
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
          <input type="text" id="service-type" value="${l.type}" data-service-index="${n}" data-field="type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input type="date" id="service-date" value="${l.date}" data-service-index="${n}" data-field="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Time (24-hour format, e.g., 14:00)</label>
          <input type="text" id="service-time" value="${l.time}" data-service-index="${n}" data-field="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">End Date (optional, leave blank if same day)</label>
          <input type="date" id="service-endDate" value="${l.endDate||""}" data-service-index="${n}" data-field="endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">End Time (optional, 24-hour format, e.g., 16:00)</label>
          <input type="text" id="service-endTime" value="${l.endTime||""}" data-service-index="${n}" data-field="endTime"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
          <input type="text" id="service-location-name" value="${l.location.name}" data-service-index="${n}" data-field="location.name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input type="text" id="service-location-address" value="${l.location.address}" data-service-index="${n}" data-field="location.address"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
          <input type="text" id="service-location-phone" value="${l.location.phone||""}" data-service-index="${n}" data-field="location.phone"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" placeholder="(555) 123-4567">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Website (optional)</label>
          <input type="url" id="service-location-website" value="${l.location.website||""}" data-service-index="${n}" data-field="location.website"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" placeholder="https://example.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea id="service-description" rows="3" data-service-index="${n}" data-field="description"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900">${l.description||""}</textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Dress Code (optional)</label>
          <input type="text" id="service-dresscode" value="${l.dresscode||""}" data-service-index="${n}" data-field="dresscode"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900" placeholder="Business casual">
        </div>
      </div>
    `;return}const i={hero:[{key:"name",label:"Full Name",type:"text"},{key:"birthDate",label:"Birth Date",type:"date"},{key:"deathDate",label:"Death Date",type:"date"},{key:"subtitle",label:"Subtitle",type:"text"},{key:"mainImage",label:"Portrait Image",type:"image",placeholder:"/images/portrait.jpg or Cloudinary URL"},{key:"backgroundImage",label:"Background Image",type:"image",placeholder:"Optional: Custom background image"}],biography:[{key:"visible",label:"Show Biography Section",type:"checkbox"},{key:"title",label:"Section Title",type:"text"},{key:"content",label:"Biography Content",type:"textarea",rows:10}],highlights:[{key:"visible",label:"Show Cherished Memories",type:"checkbox"},{key:"highlights",label:"Cherished Memories (one per line)",type:"textarea",rows:8,placeholder:"Enter each memory on a new line"}],video:[{key:"visible",label:"Show Video Section",type:"checkbox"},{key:"sectionTitle",label:"Section Title",type:"text",placeholder:"In Their Own Words"},{key:"description",label:"Video Description",type:"text"},{key:"videoUrl",label:"Video URL",type:"video",placeholder:"/videos/memorial-video.mp4 or Cloudinary URL"},{key:"posterImage",label:"Video Poster Image",type:"image",placeholder:"/images/video-poster.jpg"}],donations:[{key:"visible",label:"Show Donations Section",type:"checkbox"},{key:"sectionTitle",label:"Section Title",type:"text",placeholder:"Honor Their Memory"},{key:"customMessage",label:"Custom Message",type:"textarea",rows:3},{key:"venmoUsername",label:"Venmo Username",type:"text",placeholder:"@username"},{key:"venmoImage",label:"Venmo QR Code/Image",type:"image",placeholder:"Upload QR Code"},{key:"cashappUsername",label:"Cash App Username",type:"text",placeholder:"$username"},{key:"cashappImage",label:"Cash App QR Code/Image",type:"image",placeholder:"Upload QR Code"},{key:"zelleEmail",label:"Zelle Email",type:"email",placeholder:"email@example.com"},{key:"zelleImage",label:"Zelle QR Code/Image",type:"image",placeholder:"Upload QR Code"}],funeral:[{key:"visible",label:"Show Funeral Section",type:"checkbox"},{key:"sectionTitle",label:"Section Title",type:"text",placeholder:"Service Information"},{key:"subtitle",label:"Subtitle Text",type:"text",placeholder:"Please join us as we celebrate their life and honor their memory"}],specialInstructions:[{key:"specialInstructionsVisible",label:"Show Special Instructions",type:"checkbox"},{key:"specialInstructions",label:"Special Instructions",type:"textarea",rows:5,placeholder:"Please arrive 15 minutes early for seating..."}],flowersInfo:[{key:"flowersInfoVisible",label:"Show Flowers/Donation Info",type:"checkbox"},{key:"flowersInfo",label:"Flowers/Donation Information",type:"textarea",rows:3,placeholder:"In lieu of flowers, the family requests..."}],services:[{key:"info",label:"Service Management",type:"info",message:"Service events are complex structured data. To edit services, dates, times, and locations, please update the database directly or contact support."}],reception:[{key:"visible",label:"Show Reception Information",type:"checkbox"},{key:"location",label:"Reception Location",type:"text",placeholder:"St. Mary's Parish Hall"},{key:"time",label:"Reception Time",type:"text",placeholder:"Following the service"},{key:"description",label:"Reception Description",type:"textarea",rows:3,placeholder:"Light refreshments will be served..."}],gallery:[{key:"visible",label:"Show Gallery Section",type:"checkbox"},{key:"sectionTitle",label:"Section Title",type:"text",placeholder:"Treasured Moments"},{key:"images",label:"Reorder Images",type:"reorder_gallery"}],footer:[{key:"visible",label:"Show Footer",type:"checkbox"},{key:"quote",label:"Memorial Quote",type:"textarea",rows:2},{key:"credit",label:"Footer Credit Text",type:"text",placeholder:"Created with love by the Family • 2024"}],comments:[{key:"visible",label:"Show Memories Section",type:"checkbox"},{key:"autoApprove",label:"Auto-approve New Comments",type:"checkbox"},{key:"sectionTitle",label:"Section Title",type:"text",placeholder:"Share Your Memories"},{key:"subtitle",label:"Subtitle Text",type:"text",placeholder:"Leave a message to honor their memory..."}]}[e]||[];let a=e;(e==="specialInstructions"||e==="flowersInfo")&&(a="funeral");const r=b[a]||{};t.innerHTML=i.map(n=>{let d=r[n.key]?.value||"";if(e==="highlights"&&n.key==="highlights")try{d=JSON.parse(r[n.key]?.value||"[]").join(`
`)}catch{d=""}n.type==="checkbox"&&!r[n.key]&&(d="true");const l=`modal-${e}-${n.key}`,c=a;if(n.type==="info")return`
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800">${n.message}</p>
        </div>
      `;if(n.type==="checkbox")return`
        <div class="flex items-center p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="${l}"
            ${d==="true"||d===!0?"checked":""}
            data-section="${c}"
            data-key="${n.key}"
            class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label for="${l}" class="ml-3 text-sm font-medium text-gray-700">
            ${n.label}
          </label>
        </div>
      `;if(n.type==="image")return`
        <div>
          <label for="${l}" class="block text-sm font-medium text-gray-700 mb-2">
            ${n.label}
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              id="${l}"
              value="${d}"
              data-section="${c}"
              data-key="${n.key}"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
              placeholder="${n.placeholder||""}"
            />
            <button
              type="button"
              onclick="uploadImageForField('${l}')"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Upload
            </button>
          </div>
          <input type="file" id="${l}-file" accept="image/*" class="hidden" />
          <p class="mt-1 text-xs text-gray-500">You can paste a Cloudinary URL or upload a new image</p>
        </div>
      `;if(n.type==="video")return`
        <div>
          <label for="${l}" class="block text-sm font-medium text-gray-700 mb-2">
            ${n.label}
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              id="${l}"
              value="${d}"
              data-section="${c}"
              data-key="${n.key}"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
              placeholder="${n.placeholder||""}"
            />
            <button
              type="button"
              onclick="uploadVideoForField('${l}')"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Upload Video
            </button>
          </div>
          <input type="file" id="${l}-file" accept="video/*" class="hidden" />
          <p class="mt-1 text-xs text-gray-500">You can paste a Cloudinary URL or upload a new video (max 100MB recommended)</p>
        </div>
      `;if(n.type==="reorder_gallery"){const p=(x.images||[]).map((w,k)=>`
        <div class="reorder-item relative bg-white rounded-lg shadow-md overflow-hidden cursor-move hover:shadow-lg transition-shadow" 
             draggable="true" data-index="${k}" data-image-url="${w.src}">
          <div class="aspect-square overflow-hidden bg-warm-gray-200">
            <img src="${w.src}" alt="${w.alt}" class="w-full h-full object-cover" />
          </div>
          <div class="absolute top-2 left-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            ${k+1}
          </div>
          <div class="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
            <svg class="w-8 h-8 text-white drop-shadow-lg opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </div>
        </div>
      `).join("");return`
        <div class="mt-6 border-t border-gray-200 pt-6">
          <label class="block text-sm font-medium text-gray-700 mb-4">
            ${n.label}
          </label>
          <div id="reorderList" class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
            ${p}
          </div>
          <p class="text-xs text-gray-500">Drag and drop images to reorder them. Changes are saved when you click "Save Changes".</p>
        </div>
      `}else return n.type==="textarea"?`
        <div>
          <label for="${l}" class="block text-sm font-medium text-gray-700 mb-2">
            ${n.label}
          </label>
          <textarea
            id="${l}"
            rows="${n.rows||4}"
            data-section="${c}"
            data-key="${n.key}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            placeholder="${n.placeholder||""}"
          >${d}</textarea>
        </div>
      `:`
        <div>
          <label for="${l}" class="block text-sm font-medium text-gray-700 mb-2">
            ${n.label}
          </label>
          <input
            type="${n.type}"
            id="${l}"
            value="${d}"
            data-section="${c}"
            data-key="${n.key}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            placeholder="${n.placeholder||""}"
          />
        </div>
      `}).join(""),t.querySelectorAll(".reorder-item").forEach(n=>{n.addEventListener("dragstart",j),n.addEventListener("dragover",H),n.addEventListener("drop",R),n.addEventListener("dragend",N)})}async function Q(e){const t=`${e}-file`,o=document.getElementById(t),i=document.getElementById(e);o&&(o.click(),o.onchange=async a=>{const r=a.target.files?.[0];if(!r)return;const s=i.value;i.value="Uploading...",i.disabled=!0;try{const n=new FormData;n.append("file",r),n.append("folder","memorial/portraits");const l=await(await fetch("/api/upload-image",{method:"POST",body:n})).json();l.success?(i.value=l.url,alert(`✅ Image uploaded successfully!

The URL has been set. Click "Save Changes" to apply it.`)):(alert("❌ Upload failed: "+l.error+(l.details?`

`+l.details:"")),i.value=s)}catch(n){console.error("Upload error:",n),alert("❌ Failed to upload image: "+n.message),i.value=s}finally{i.disabled=!1,o.value=""}})}async function Y(e){const t=`${e}-file`,o=document.getElementById(t),i=document.getElementById(e);o&&(o.click(),o.onchange=async a=>{const r=a.target.files?.[0];if(!r)return;const s=r.size/(1024*1024);if(s>100&&!confirm(`This video is ${s.toFixed(1)}MB. Large videos may take a while to upload. Continue?`)){o.value="";return}const n=i.value;i.value=`Uploading video (${s.toFixed(1)}MB)...`,i.disabled=!0;try{const d=new FormData;d.append("file",r),d.append("folder","memorial/videos");const c=await(await fetch("/api/upload-image",{method:"POST",body:d})).json();c.success?(i.value=c.url,alert(`✅ Video uploaded successfully!

The URL has been set. Click "Save Changes" to apply it.`)):(alert("❌ Upload failed: "+c.error+(c.details?`

`+c.details:"")),i.value=n)}catch(d){console.error("Upload error:",d),alert("❌ Failed to upload video: "+d.message),i.value=n}finally{i.disabled=!1,o.value=""}})}async function W(){if(!u)return;if(u.startsWith("service-")){const a=parseInt(u.split("-")[1]),s=document.getElementById("modalContent").querySelectorAll("input, textarea"),n={};s.forEach(d=>{const l=d.dataset.field;if(l){const c=d.value.trim();if(l.includes(".")){const[g,p]=l.split(".");n[g]||(n[g]={}),(c||l==="location.name"||l==="location.address")&&(n[g][p]=c)}else(c||l==="date"||l==="time"||l==="type")&&(n[l]=c)}});try{const l=await(await fetch("/api/admin/content",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({section:"funeral",key:`service${a}`,value:JSON.stringify(n)})})).json();if(l.success)D(a,n),y("Service updated successfully!","success"),h();else throw new Error(l.error||"Failed to save service")}catch(d){console.error("Error saving service:",d),y("Error saving service. Please try again.","error")}return}const e=document.getElementById("modalContent"),t=e.querySelectorAll('input:not([type="file"]):not(.hidden), textarea'),o=[],i={};if(t.forEach((a,r)=>{const s=a.dataset.section,n=a.dataset.key;if(!s||!n)return;let d;if(a.type==="checkbox"?d=a.checked?"true":"false":d=a.value,s==="highlights"&&n==="highlights"){const l=d.split(`
`).filter(c=>c.trim()).map(c=>c.trim());d=JSON.stringify(l)}o.push({section:s,key:n,value:d}),i[s]||(i[s]={}),i[s][n]=a.type==="checkbox"?a.checked:a.value}),u==="gallery"){const a=e.querySelectorAll(".reorder-item");if(a.length>0){const r=Array.from(a).map((s,n)=>({imagePath:s.dataset.imageUrl,displayOrder:n}));try{const s=r.map(n=>fetch("/api/gallery/update-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}));await Promise.all(s),console.log("Gallery order updated"),setTimeout(()=>window.location.reload(),1e3)}catch(s){console.error("Failed to update gallery order:",s),y("Failed to update gallery order","error")}}}if(o.length===0&&u!=="gallery"){y("Error: No valid fields to save","error");return}try{if(o.length>0)if((await Promise.all(o.map(s=>fetch("/api/admin/content",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}).then(n=>n.json())))).every(s=>s.success))V(u,i[u]),y("Changes saved successfully!","success"),h();else throw new Error("Some updates failed");else u==="gallery"&&(y("Changes saved successfully!","success"),h())}catch(a){console.error("Error saving content:",a),y("Error saving changes. Please try again.","error")}}window.toggleEditButtons=v;window.restoreHiddenSections=E;window.openEditModal=z;window.closeEditModal=h;window.uploadImageForField=Q;window.uploadVideoForField=Y;window.saveAllModalContent=W;window.addEventListener("load",function(){console.log("=== Window loaded, initializing toggle ===");const e=document.getElementById("editModeToggle"),t=document.getElementById("editModeLabel");$(),localStorage.getItem("editModeEnabled")==="false"&&(document.body.classList.add("hide-edit-buttons"),setTimeout(()=>v(!1),100),e&&(e.checked=!1),t&&(t.textContent="OFF")),e&&e.addEventListener("change",function(){const i=this.checked;i?(E(),v(!0)):v(!1),t&&(t.textContent=i?"ON":"OFF"),localStorage.setItem("editModeEnabled",i)})});document.addEventListener("keydown",e=>{e.key==="Escape"&&u&&h()});document.getElementById("editModal")?.addEventListener("click",e=>{e.target.id==="editModal"&&h()});
