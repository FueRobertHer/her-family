let l=[],o=0,m=0;const S=10;let h=!1,u=!0,g=1;const a=document.getElementById("commentsTrack"),C=document.getElementById("prevCommentBtn"),I=document.getElementById("nextCommentBtn"),U=document.getElementById("initialLoader");function j(){window.innerWidth>=1280?g=3:window.innerWidth>=768?g=2:g=1,b(!1)}window.addEventListener("resize",j);j();async function w(){if(!(h||!u)){h=!0;try{const t=await(await fetch(`/api/comments?limit=${S}&offset=${m}`)).json();if(t.success){const n=t.data;n.length<S&&(u=!1),m===0&&n.length===0?(a.innerHTML=`
            <div class="w-full text-center py-12 text-warm-gray-600">
              <p>No memories shared yet. Be the first to share one.</p>
            </div>
          `,C.disabled=!0,I.disabled=!0):(m===0&&U?.remove(),l=[...l,...n],H(n),m+=n.length,D())}}catch(e){console.error("Error loading comments:",e),m===0&&(a.innerHTML=`
          <div class="w-full text-center py-12 text-red-600">
            <p>Error loading memories. Please refresh to try again.</p>
          </div>
        `)}finally{h=!1}}}function H(e){const t=document.createDocumentFragment();e.forEach(n=>{const s=document.createElement("div");s.className="flex-shrink-0 w-full md:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)]",s.innerHTML=`
        <div class="bg-white rounded-xl p-6 shadow-sm border border-warm-gray-100 h-full flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-warm-gray-100 flex items-center justify-center text-warm-gray-500 font-bold text-lg">
                ${n.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 class="font-semibold text-warm-gray-900">${c(n.name)}</h4>
                ${n.relationship?`<p class="text-xs text-warm-gray-500">${c(n.relationship)}</p>`:""}
              </div>
            </div>
            <time class="text-xs text-warm-gray-400 whitespace-nowrap" datetime="${n.createdAt}">
              ${O(n.createdAt)}
            </time>
          </div>
          
          <div class="flex-grow space-y-4">
             ${n.imageUrl?`
              <div class="relative group cursor-pointer overflow-hidden rounded-lg mb-3" onclick="openCommentLightbox('${c(n.imageUrl)}', 'Photo from ${c(n.name)}')">
                <img 
                  src="${c(n.imageUrl)}" 
                  alt="Memory photo"
                  class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            `:""}
            <p class="text-warm-gray-700 leading-relaxed text-sm whitespace-pre-wrap line-clamp-6">${c(n.message)}</p>
          </div>
        </div>
      `,t.appendChild(s)}),a.appendChild(t)}function b(e=!0){if(!a)return;const t=a.children;if(t.length===0)return;const n=t[0].offsetWidth+24,s=-o*n;e?a.style.transition="transform 0.5s ease-out":a.style.transition="none",a.style.transform=`translateX(${s}px)`,D()}function D(){C.disabled=o===0;const e=Math.max(0,l.length-g),t=o<e||u;I.disabled=!t}function z(){const e=Math.max(0,l.length-g);o<e?(o++,b(!0),u&&!h&&l.length-o<=g*2&&w()):u&&!h&&w().then(()=>{l.length>e&&(o++,b(!0))})}function W(){o>0&&(o--,b(!0))}C?.addEventListener("click",W);I?.addEventListener("click",z);w();const E=document.getElementById("commentForm"),r=document.getElementById("submitBtn"),x=document.getElementById("formMessage"),T=document.getElementById("message"),v=document.getElementById("charCount");T?.addEventListener("input",()=>{const e=T.value.length;v.textContent=`${e}/1000`,e>900?v.classList.add("text-red-500"):v.classList.remove("text-red-500")});function y(e,t=!1){x.textContent=e,x.className=`text-sm p-3 rounded-lg ${t?"bg-red-50 text-red-700":"bg-green-50 text-green-700"}`,x.classList.remove("hidden"),setTimeout(()=>x.classList.add("hidden"),5e3)}const A=document.getElementById("selectImageBtn"),p=document.getElementById("commentImage"),f=document.getElementById("imageFileName"),d=document.getElementById("clearImageBtn");A?.addEventListener("click",()=>p?.click());p?.addEventListener("change",e=>{const t=e.target.files?.[0];t&&(f&&(f.textContent=t.name),d&&d.classList.remove("hidden"))});d?.addEventListener("click",()=>{p&&(p.value=""),f&&(f.textContent=""),d&&d.classList.add("hidden")});E?.addEventListener("submit",async e=>{if(e.preventDefault(),r.disabled)return;const t=new FormData(E),n=p?.files?.[0],s={name:t.get("name")?.toString().trim(),email:t.get("email")?.toString().trim(),relationship:t.get("relationship")?.toString().trim(),message:t.get("message")?.toString().trim()};if(!s.name||!s.message){y("Please fill in all required fields.",!0);return}if(n&&n.size>5*1024*1024){y("Image size must be less than 5MB.",!0);return}r.disabled=!0;const N=r.textContent;r.textContent="Submitting...";try{if(n){r.textContent="Uploading Image...";const L=new FormData;L.append("file",n),L.append("folder","memorial/comments");const M=await(await fetch("/api/upload-image",{method:"POST",body:L})).json();if(M.success)s.imageUrl=M.url;else throw new Error("Failed to upload image")}r.textContent="Saving Memory...";const $=await(await fetch("/api/comments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})).json();if($.success)y("Thank you for sharing your memory!"),E.reset(),v.textContent="0/1000",f&&(f.textContent=""),d&&d.classList.add("hidden"),l=[],m=0,u=!0,o=0,a.innerHTML="",w();else throw new Error($.error||"Failed to submit comment")}catch(k){console.error("Submit error:",k),y("Failed to submit comment. Please try again.",!0)}finally{r.disabled=!1,r.textContent=N}});function c(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function O(e){return new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}const i=document.getElementById("commentLightbox"),F=document.getElementById("commentLightboxImage"),P=document.getElementById("commentLightboxCaption"),R=document.getElementById("closeCommentLightbox");window.openCommentLightbox=(e,t)=>{F&&(F.src=e),P&&(P.textContent=t||""),i&&(i.classList.remove("hidden"),i.classList.add("flex"),document.body.style.overflow="hidden")};function B(){i&&(i.classList.add("hidden"),i.classList.remove("flex"),document.body.style.overflow="")}R?.addEventListener("click",B);i?.addEventListener("click",e=>{e.target===i&&B()});document.addEventListener("keydown",e=>{e.key==="Escape"&&i&&!i.classList.contains("hidden")&&B()});
