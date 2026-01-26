if(document.querySelector(".tab-button")){let g=function(){if(d.length===0){i.innerHTML=`
          <div class="p-6 text-center text-gray-500">
            <p>No comments found for this filter.</p>
          </div>
        `;return}const t=d.map(e=>`
        <div class="p-6 comment-item" data-id="${e.id}">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <h4 class="text-lg font-medium text-gray-900">${o(e.name)}</h4>
                ${e.relationship?`<span class="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">${o(e.relationship)}</span>`:""}
                <span class="ml-2 px-2 py-1 text-xs rounded ${e.status==="approved"?"bg-green-100 text-green-800":e.status==="rejected"?"bg-red-100 text-red-800":"bg-yellow-100 text-yellow-800"}">
                  ${e.status.charAt(0).toUpperCase()+e.status.slice(1)}
                </span>
              </div>
              ${e.email?`<p class="text-sm text-gray-600 mb-2">Email: ${o(e.email)}</p>`:""}
              ${e.imageUrl?`
                <div class="mb-3">
                  <a href="${o(e.imageUrl)}" target="_blank" rel="noopener noreferrer" class="inline-block">
                    <img src="${o(e.imageUrl)}" alt="Attached photo" class="h-32 w-auto object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity" />
                  </a>
                </div>
              `:""}
              <p class="text-gray-700 mb-3">${o(e.message)}</p>
              <p class="text-sm text-gray-500">
                Submitted: ${l(e.createdAt)}
                ${e.updatedAt!==e.createdAt?` • Updated: ${l(e.updatedAt)}`:""}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0">
              ${e.status==="pending"?`
                <button
                  onclick="moderateComment(${e.id}, 'approve')"
                  class="mr-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onclick="moderateComment(${e.id}, 'reject')"
                  class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Reject
                </button>
              `:e.status==="approved"?`
                <button
                  onclick="moderateComment(${e.id}, 'reject')"
                  class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Reject
                </button>
              `:e.status==="rejected"?`
                <button
                  onclick="moderateComment(${e.id}, 'approve')"
                  class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <span class="text-sm text-gray-500 ml-2">Rejected</span>
              `:""}
            </div>
          </div>
        </div>
      `).join("");i.innerHTML=t},o=function(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML},l=function(t){return new Date(t).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})},p="pending",d=[],r={pending:0,approved:0,total:0};const u=document.querySelectorAll(".tab-button"),i=document.getElementById("commentsContainer"),m=document.getElementById("sectionTitle"),x=document.getElementById("pendingCount"),y=document.getElementById("approvedCount"),b=document.getElementById("rejectedCount"),h=document.getElementById("totalCount");async function c(t="pending"){try{console.log(`Loading comments with status: ${t}`);const e=await fetch(`/api/admin/comments?status=${t}`);console.log(`Response status: ${e.status}`);const n=await e.json();if(console.log("API result:",n),n.success){d=n.data,r=n.counts,x.textContent=r.pending,y.textContent=r.approved,b.textContent=r.rejected,h.textContent=r.total;const s={pending:`Pending Review (${r.pending})`,approved:`Approved Comments (${r.approved})`,rejected:`Rejected Comments (${r.rejected})`,all:`All Comments (${r.total})`};m.textContent=s[t]||"Comments",g()}else throw new Error(n.error)}catch(e){console.error("Error loading comments:",e),i.innerHTML=`
          <div class="p-6 text-center text-red-600">
            <p>Error loading comments. Please refresh the page.</p>
          </div>
        `}}window.moderateComment=async function(t,e){if(!(e==="reject"&&!confirm("Are you sure you want to reject this comment?")))try{const s=await(await fetch("/api/admin/comments",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:t,action:e})})).json();if(s.success){c(p);const a=document.createElement("div");a.className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50",a.textContent=s.message,document.body.appendChild(a),setTimeout(()=>{document.body.removeChild(a)},3e3)}else throw new Error(s.error)}catch(n){console.error("Error moderating comment:",n),alert("Error processing request. Please try again.")}},u.forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.tab;u.forEach(n=>{n.classList.remove("border-indigo-500","text-indigo-600"),n.classList.add("border-transparent","text-gray-500")}),t.classList.remove("border-transparent","text-gray-500"),t.classList.add("border-indigo-500","text-indigo-600"),p=e,c(e)})}),c("pending"),document.querySelector('[data-tab="pending"]').click()}
