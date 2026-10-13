(function(){
'use strict';
if(window.StartiTracking)return;
window.StartiTracking={version:'2026-09-08+canvas-share-2026-10-13'};
function pushGtmEvent(event){try{(window.gtmDataLayer=window.gtmDataLayer||[]).push(event);}catch{}}
const time=(function(){

                            
                           
                   
                                 
                        
 

                            
              
 

                             
                 
                              
   
                                                                                      
                               
 

                                      
                    
 

                  
                  
                                
                       
                            
                  
 

                     
                              
                   
                         
                       
 

const PAGE_TYPE_BY_PATH                                  = {
  '/': 'home',
  '/lp/ai-studio': 'paid_lp',
  '/lp/ctv-performance': 'paid_lp',
  '/lp/creative-studio': 'paid_lp',
  '/pricing': 'pricing'
}

const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'

let trackerState                          

const normalizePagePath = (path        )         => {
  const withoutQueryOrHash = path.split(/[?#]/, 1)[0] || '/'
  const normalized = withoutQueryOrHash.replace(/\/+$/, '')
  return normalized || '/'
}

const getPageType = (path        )                       => {
  return document.body.dataset.pageType || PAGE_TYPE_BY_PATH[normalizePagePath(path)] || ''
}

const getDefaultNow = ()         => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now()
  }
  return Date.now()
}

const isPageActive = ()          => {
  if (document.visibilityState !== 'visible') return false
  if (typeof document.hasFocus !== 'function') return true
  return document.hasFocus()
}

const getActiveMilliseconds = (page           , now        )         => {
  const openSegmentMs = page.activeSince === null ? 0 : Math.max(0, now - page.activeSince)
  return page.accumulatedMs + openSegmentMs
}

const buildEvent = (page           , now        )                      => ({
  event: 'page_active_time',
  page_path: page.pagePath,
  page_type: page.pageType,
  page_name: document.body.dataset.pageName || '',
  active_seconds: Math.max(0, Math.floor(getActiveMilliseconds(page, now) / 1000)),
  ...(document.body.dataset.shareProjectId ? { share_project_id: document.body.dataset.shareProjectId } : {})
})

const syncPageActivity = (page           , now        )       => {
  if (isPageActive()) {
    if (page.activeSince === null) page.activeSince = now
    return
  }

  if (page.activeSince !== null) {
    page.accumulatedMs += Math.max(0, now - page.activeSince)
    page.activeSince = null
  }
}

const emitPage = (state              )                             => {
  const page = state.currentPage
  if (!page || page.emitted) return null

  const now = state.now()
  syncPageActivity(page, now)
  const event = buildEvent(page, now)
  page.emitted = true

  // pushGtmEvent pushes the event synchronously before its best-effort user lookup.
  void pushGtmEvent(event)
  return event
}

const startPage = (state              , path        )       => {
  const pagePath = normalizePagePath(path)
  if (state.currentPage?.pagePath === pagePath) {
    if (!state.currentPage.emitted) syncPageActivity(state.currentPage, state.now())
    return
  }

  emitPage(state)
  const page            = {
    pagePath,
    pageType: getPageType(pagePath),
    accumulatedMs: 0,
    activeSince: null,
    emitted: false
  }

  state.currentPage = page
  syncPageActivity(page, state.now())
}

const getCurrentPath = (router                      )         => {
  return router.currentRoute?.value?.path || window.location.pathname
}

/**
 * Returns a snapshot for the current page without finalizing or pushing it.
 * Landing lead forms use this so the submitted remark contains the same event shape.
 */
const getCurrentPageActiveTimeEvents = ()                        => {
  if (!trackerState?.currentPage) return []

  const page = trackerState.currentPage
  if (!page.pageType || page.emitted) return []

  return [buildEvent(page, trackerState.now())]
}

const setupPageActiveTimeTracking = (
  router                      ,
  options                                = {}
)                           => {
  if (!isClient) return undefined

  if (trackerState?.router === router && trackerState.teardown) {
    return trackerState.teardown
  }

  trackerState?.teardown?.()

  const state               = {
    router,
    now: options.now || getDefaultNow
  }
  trackerState = state

  const syncCurrentPage = () => {
    const page = state.currentPage
    if (page && !page.emitted) syncPageActivity(page, state.now())
  }

  const handleRoute = (to                     ) => {
    startPage(state, to?.path || window.location.pathname)
  }

  const handlePageHide = () => {
    emitPage(state)
  }

  const handlePageShow = () => {
    if (state.currentPage?.emitted) {
      state.currentPage = undefined
      startPage(state, getCurrentPath(router))
      return
    }
    syncCurrentPage()
  }

  const removeAfterEach = router.afterEach(handleRoute)
  document.addEventListener('visibilitychange', syncCurrentPage)
  window.addEventListener('focus', syncCurrentPage)
  window.addEventListener('blur', syncCurrentPage)
  window.addEventListener('pagehide', handlePageHide)
  window.addEventListener('pageshow', handlePageShow)

  const teardown = () => {
    removeAfterEach?.()
    document.removeEventListener('visibilitychange', syncCurrentPage)
    window.removeEventListener('focus', syncCurrentPage)
    window.removeEventListener('blur', syncCurrentPage)
    window.removeEventListener('pagehide', handlePageHide)
    window.removeEventListener('pageshow', handlePageShow)
    emitPage(state)

    if (trackerState === state) trackerState = undefined
    if (state.teardown === teardown) state.teardown = undefined
  }

  state.teardown = teardown

  const initialize = () => {
    if (trackerState !== state) return
    startPage(state, getCurrentPath(router))
  }

  if (router.isReady) {
    void router.isReady().then(initialize)
  } else {
    initialize()
  }

  return teardown
}

return {setupPageActiveTimeTracking,getCurrentPageActiveTimeEvents};
})();
const getCurrentPageActiveTimeEvents=time.getCurrentPageActiveTimeEvents;
const lead=(function(){

                             

                          
               
                             
                   
                           
               
 

                                
               
                                  
                   
                                
              
 

                          
                
                   
                  
                 
               
                  
                 
                  
                     
                      
              
                   
               
                           
                      
                          
                                        
 

                           
                    
                    
                      
                     
                  
               
                      
                  
 

const CONTEXT_STORAGE_KEY = 'st_cta'
const LEGACY_CONTEXT_STORAGE_KEY = 'starti:landing-cta-context'
const TOUCH_STORAGE_KEY = 'st_touch'
const GA_MEASUREMENT_ID = 'G-4FK9KHW716'
const SOURCE_KEYS                                                                                                                             = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid'
]

const emptyAttribution = ()                     => ({
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_content: '',
  utm_term: '',
  gclid: '',
  landing_page: '',
  referrer: ''
})

const emptyCtaContext = ()                          => ({
  ctaId: '',
  ctaLocation: '',
  sectionId: '',
  pageType: '',
  tier: ''
})

const isClient = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const readStorageJson = (key        )                                 => {
  if (!isClient()) return null
  try {
    const value = localStorage.getItem(key)
    if (!value) return null
    const parsed          = JSON.parse(value)
    return parsed && typeof parsed === 'object' ? parsed                            : null
  } catch {
    return null
  }
}

const writeStorageJson = (key        , value         )       => {
  if (!isClient()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Attribution is best effort and must never block the lead flow.
  }
}

const asString = (value         )         => typeof value === 'string' ? value : ''

const normalizeAttribution = (value                                )                     => {
  const empty = emptyAttribution()
  return {
    utm_source: asString(value?.utm_source) || empty.utm_source,
    utm_medium: asString(value?.utm_medium) || empty.utm_medium,
    utm_campaign: asString(value?.utm_campaign) || empty.utm_campaign,
    utm_content: asString(value?.utm_content) || empty.utm_content,
    utm_term: asString(value?.utm_term) || empty.utm_term,
    gclid: asString(value?.gclid) || empty.gclid,
    landing_page: asString(value?.landing_page) || empty.landing_page,
    referrer: asString(value?.referrer) || empty.referrer
  }
}

const createSubmissionId = ()         => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `st_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

const readGaClientIdFromCookie = ()         => {
  if (!isClient()) return ''
  const match = document.cookie.match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(\d+\.\d+)/)
  return match?.[1] || ''
}

const getGaClientId = ()                  => new Promise((resolve) => {
  if (!isClient()) {
    resolve('')
    return
  }

  let done = false
  const finish = (value         ) => {
    if (done) return
    done = true
    clearTimeout(timeoutId)
    resolve(typeof value === 'string' ? value : '')
  }

  const timeoutId = setTimeout(() => finish(readGaClientIdFromCookie()), 1000)

  if (typeof window.gtag === 'function') {
    try {
      window.gtag('get', GA_MEASUREMENT_ID, 'client_id', finish)
    } catch {
      finish(readGaClientIdFromCookie())
    }
  } else {
    finish(readGaClientIdFromCookie())
  }
})

/** Capture first-touch attribution, replacing it only when a new source is present. */
const captureLandingAttribution = ()                     => {
  if (!isClient()) return emptyAttribution()

  const query = new URLSearchParams(window.location.search)
  const stored = normalizeAttribution(readStorageJson(TOUCH_STORAGE_KEY))
  const hasSource = SOURCE_KEYS.some((key) => Boolean(query.get(key)))
  const next = hasSource || !stored.landing_page
    ? {
        utm_source: query.get('utm_source') || '',
        utm_medium: query.get('utm_medium') || '',
        utm_campaign: query.get('utm_campaign') || '',
        utm_content: query.get('utm_content') || '',
        utm_term: query.get('utm_term') || '',
        gclid: query.get('gclid') || '',
        landing_page: window.location.pathname,
        referrer: document.referrer || ''
      }
    : stored

  writeStorageJson(TOUCH_STORAGE_KEY, next)
  return next
}

const readLandingCtaContext = ()                          => {
  const stored = readStorageJson(CONTEXT_STORAGE_KEY) || readStorageJson(LEGACY_CONTEXT_STORAGE_KEY)
  const empty = emptyCtaContext()
  const pageType = asString(stored?.pageType)
  const ctaLocation = asString(stored?.ctaLocation)
  return {
    ctaId: asString(stored?.ctaId) || asString(stored?.cta_id) || empty.ctaId,
    ctaLocation: ctaLocation === 'nav' || ctaLocation === 'body' ? ctaLocation : empty.ctaLocation,
    sectionId: asString(stored?.sectionId) || asString(stored?.section_id) || empty.sectionId,
    pageType: pageType || empty.pageType,
    page_name: asString(stored?.page_name),
    tier: asString(stored?.tier) || empty.tier
  }
}

const trackLandingEvent = (event        , payload                          = {}) => {
  void pushGtmEvent({ event, ...payload })
}

const trackLandingCta = (context                   ) => {
  captureLandingAttribution()
  const storedContext                          = {
    ctaId: context.ctaId,
    ctaLocation: context.ctaLocation,
    sectionId: context.sectionId,
    pageType: context.pageType,
    page_name: context.page_name || '',
    tier: context.tier || ''
  }
  writeStorageJson(CONTEXT_STORAGE_KEY, storedContext)

  trackLandingEvent('cta_click', {
    cta_id: storedContext.ctaId,
    cta_location: storedContext.ctaLocation,
    section_id: storedContext.sectionId,
    page_type: storedContext.pageType,
    tier: storedContext.tier,
    page_name: storedContext.page_name,
    ...(context.shareProjectId ? { share_project_id: context.shareProjectId } : {})
  })
}

const buildLeadPayload = async (fields                   ) => {
  const touch = fields.touch ?? captureLandingAttribution()
  const cta = fields.cta ?? readLandingCtaContext()
  const gaClientId = await getGaClientId()
  const pageActiveTime = fields.pageActiveTime ?? (fields.pageType ? getCurrentPageActiveTimeEvents() : [])
  const meta                          = {
    job_title: fields.jobTitle || '',
    company_size: fields.companySize || '',
    utm_source: touch.utm_source || '',
    utm_medium: touch.utm_medium || '',
    utm_campaign: touch.utm_campaign || '',
    utm_content: touch.utm_content || '',
    utm_term: touch.utm_term || '',
    gclid: touch.gclid || '',
    landing_page: touch.landing_page || '',
    referrer: touch.referrer || '',
    form_page_path: isClient() ? window.location.pathname : fields.page || '',
    source_cta_id: cta.ctaId || '',
    source_section_id: cta.sectionId || '',
    tier: cta.tier || '',
    ga_client_id: gaClientId,
    submission_id: fields.submissionId || '',
    interest: fields.interestOffering || '',
    source_page: fields.sourcePage || ''
  }

  if (fields.shareProjectId) meta.share_project_id = fields.shareProjectId
  if (fields.pageType) meta.page_active_time = pageActiveTime

  return {
    fistName: fields.firstName,
    lastName: fields.lastName,
    email: fields.email,
    name: fields.company,
    jobTitle: fields.jobTitle,
    companySize: fields.companySize,
    remark: `${fields.message || ''}\n\n---starti-meta---\n${JSON.stringify(meta)}`,
    source: 'OFFICIAL_SITE'
  }
}

const getLeadErrorMessage = (error         , response          )         => {
  const errorRecord = error && typeof error === 'object' ? error                        : {}
  const responseRecord = response && typeof response === 'object' ? response                        : {}
  const status = responseRecord.status
    ?? responseRecord.code
    ?? errorRecord.response?.status
    ?? errorRecord.response?.data?.code
    ?? errorRecord.code

  if (status === 400) return 'Unable to submit. Check the form and try again.'
  if (!errorRecord.response && errorRecord.request) return 'Unable to submit. Check the connection and try again.'
  return 'Unable to submit. Please try again.'
}

return {captureLandingAttribution,readLandingCtaContext,trackLandingCta,buildLeadPayload,createSubmissionId,getLeadErrorMessage};
})();
  const page = () => ({page_type:document.body.dataset.pageType||'',page_name:document.body.dataset.pageName||'',...(document.body.dataset.shareProjectId?{share_project_id:document.body.dataset.shareProjectId}:{})});
  const production = location.protocol === 'https:' && ['starti.ai','www.starti.ai','ad.starti.ai'].includes(location.hostname);
  const preview = document.body.dataset.preview === '1'; // 样板预览专用:不发 Lead API,其余链路照常
  const layer = window.gtmDataLayer = window.gtmDataLayer || [];
  layer.push(page());
  const router = {currentRoute:{value:{path:location.pathname}},afterEach:()=>()=>{}};
  time.setupPageActiveTimeTracking(router);
  lead.captureLandingAttribution();
  function click(event) {
    if (!event.isTrusted || (event.type==='click' && event.button!==0) || (event.type==='auxclick' && event.button!==1)) return;
    const el=event.target.closest?.('a[data-cta-id],button[data-cta-id],a[data-nav-id]');
    if(!el || el.disabled) return;
    if(el.dataset.ctaId) {
      lead.trackLandingCta({ctaId:el.dataset.ctaId,ctaLocation:el.dataset.ctaLocation,sectionId:el.dataset.sectionId,pageType:page().page_type,page_name:page().page_name,tier:el.dataset.tier||'',shareProjectId:document.body.dataset.shareProjectId||''});
    } else {
      const target=new URL(el.href,location.href);
      pushGtmEvent({event:'navigation_click',...page(),cta_id:el.dataset.navId,cta_location:el.dataset.ctaLocation,section_id:el.dataset.sectionId,link_path:target.pathname+target.hash});
    }
  }
  document.addEventListener('click',click,true);
  document.addEventListener('auxclick',click,true);
  const form=document.querySelector('form#demo-form[data-form="book-demo"]');
  if(form) installDemo(form);
  // Reuse the site's container and data layer. Local previews do not contact GA or the Lead API.
  if(production && !window.google_tag_manager?.['GTM-K5T37XW2'] && !document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
    layer.push({'gtm.start':Date.now(),event:'gtm.js'});
    const script=document.createElement('script');script.async=true;
    script.src='https://www.googletagmanager.com/gtm.js?id=GTM-K5T37XW2&l=gtmDataLayer';document.head.appendChild(script);
  }
  function installDemo(form) {
    let started=false,busy=false,attempt=null,accepted=null,schedulerPromise=null;
    const booked=new Set();
    const val=name=>form.elements.namedItem(name)?.value||'';
    const status=document.getElementById('demo-submit-status');
    const button=form.querySelector('[type="submit"]');
    const originalLabel=button.textContent;
    const show=text=>{status.textContent=text;status.hidden=false;status.focus();};
    function start(e){
      if(started||!e.isTrusted||e.target.name==='website'||e.target.type==='hidden')return;
      if(e.type==='input' && (!e.target.matches('input,textarea')||!e.target.value))return;
      if(e.type==='change' && !e.target.matches('select'))return;
      started=true;pushGtmEvent({event:'form_start',form_id:'demo_form',...page()});
    }
    form.addEventListener('input',start);form.addEventListener('change',start);
    const names={home:'home',video_agent:'video_agent',smart_insight:'smart_insight',creative_studio:'creative_studio',pricing:'pricing',about:'about',news:'news',case_studies:'case_studies',ai_studio_lp:'ai_studio_lp',creative_studio_lp:'creative_studio_lp','Starti Video Agent':'video_agent','Starti Smart Insight':'smart_insight','Starti Creative Studio':'creative_studio','Starti Pricing':'pricing','ai-studio-lp':'ai_studio_lp','creative-studio-lp':'creative_studio_lp',canvas_share:'canvas_share'};
    const sourcePage=cta=>names[new URLSearchParams(location.search).get('source')]||names[cta.page_name]||'';
    function eventContext(a){return {...page(),source_cta_id:a.cta.ctaId||'',source_section_id:a.cta.sectionId||'',tier:a.cta.tier||'',submission_id:a.id,interest:a.fields.interestOffering,source_page:a.fields.sourcePage};}
    function loadScheduler(){
      if(window.Calendly?.initPopupWidget)return Promise.resolve();
      if(schedulerPromise)return schedulerPromise;
      schedulerPromise=new Promise((resolve,reject)=>{
        if(!document.querySelector('link[data-starti-calendly-style]')){
          const css=document.createElement('link');css.rel='stylesheet';css.href='https://assets.calendly.com/assets/external/widget.css';css.dataset.startiCalendlyStyle='true';document.head.appendChild(css);
        }
        const existing=document.querySelector('script[data-starti-calendly]');
        const script=existing||document.createElement('script');
        const timeout=setTimeout(()=>{script.remove();reject(new Error('Scheduler timeout'));},15000);
        script.addEventListener('load',()=>{clearTimeout(timeout);resolve();},{once:true});
        script.addEventListener('error',()=>{clearTimeout(timeout);script.remove();reject(new Error('Scheduler unavailable'));},{once:true});
        if(!existing){script.async=true;script.src='https://assets.calendly.com/assets/external/widget.js';script.dataset.startiCalendly='true';document.head.appendChild(script);}
      }).catch(e=>{schedulerPromise=null;throw e;});
      return schedulerPromise;
    }
    async function openScheduler(){
      await loadScheduler();
      const a=accepted,f=a.fields;
      const url=new URL('https://calendly.com/demo-starti/30min');url.searchParams.set('hide_gdpr_banner','1');
      const join=(...v)=>v.filter(Boolean).join('|').slice(0,255);
      const utm={utmSource:a.touch.utm_source,utmMedium:a.touch.utm_medium,utmCampaign:join(a.touch.utm_campaign,page().page_type),utmContent:join(a.touch.utm_content,a.cta.ctaId,a.cta.sectionId),utmTerm:join(a.touch.utm_term,a.touch.gclid,a.cta.tier,a.id)};
      // Same popup API and UTM mapping as CalendlySchedulerModal; personal fields stay inside Calendly prefill.
      window.Calendly.initPopupWidget({url:url.toString(),prefill:{name:[f.firstName,f.lastName].filter(Boolean).join(' '),email:f.email},utm:Object.fromEntries(Object.entries(utm).filter(([,v])=>v))});
      pushGtmEvent({event:'booking_open',...eventContext(a)});
    }
    window.addEventListener('message',event=>{
      if(!accepted||event.origin!=='https://calendly.com'||event.data?.event!=='calendly.event_scheduled')return;
      const valid=[...document.querySelectorAll('.calendly-popup iframe')].some(frame=>{
        try{return new URL(frame.src).origin==='https://calendly.com'&&frame.contentWindow===event.source;}catch{return false;}
      });
      if(!valid||booked.has(accepted.id))return;
      booked.add(accepted.id);pushGtmEvent({event:'book_demo',...eventContext(accepted)});
      show('Your demo is booked. Check your email for the invitation.');
    });
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(busy)return;
      if(accepted){busy=true;button.disabled=true;try{await openScheduler();}catch{show('Your request has been received. Please try opening the scheduler again.');}finally{busy=false;button.disabled=false;}return;}
      if(val('website')||!form.reportValidity())return;
      if(!production&&!preview){show('This preview is not connected to booking yet. Your request has not been sent.');return;}
      busy=true;button.disabled=true;
      try{
        if(!attempt){
          const cta=lead.readLandingCtaContext(),touch=lead.captureLandingAttribution(),id=lead.createSubmissionId();
          const fields={firstName:val('first_name'),lastName:val('last_name'),email:val('email'),company:val('company'),jobTitle:val('job_title'),companySize:val('company_size'),message:val('message'),interestOffering:val('interest'),sourcePage:sourcePage(cta),submissionId:id,shareProjectId:document.body.dataset.shareProjectId||'',pageType:page().page_type,page:location.pathname,cta,touch,pageActiveTime:time.getCurrentPageActiveTimeEvents()};
          attempt={id,cta,touch,fields,payload:null};
        }
        if(!attempt.payload)attempt.payload=await lead.buildLeadPayload(attempt.fields);
        if(preview){console.log('Preview: Lead API payload not sent',attempt.payload);}else{
        const headers={'Content-Type':'application/json'};
        // Same public contact endpoint and optional headers as request.ts; credentials never enter analytics.
        try{
          let uuid=localStorage.getItem('uuid');if(!uuid){uuid=lead.createSubmissionId();localStorage.setItem('uuid',uuid);}headers.uuid=uuid;
          const cookie=document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('Authorization='));
          const token=cookie?decodeURIComponent(cookie.slice(14)):localStorage.getItem('Authorization');if(token)headers.Authorization=token;
        }catch{}
        const response=await fetch('https://gateway.ochanges.com/adv/api/v1/contact',{method:'POST',headers,credentials:'omit',body:JSON.stringify(attempt.payload),signal:AbortSignal.timeout(80000)});
        const data=await response.json();
        if(!response.ok||data?.code!==200)throw new Error('Lead not accepted');
        }
        accepted=attempt;
        show('Your request has been received. Choose a time for your demo.');
        button.textContent='Open scheduler';
        pushGtmEvent({event:'generate_lead',form_id:'demo_form',...eventContext(accepted)});
        try{await openScheduler();}catch{show('Your request has been received. Please try opening the scheduler again.');}
      }catch{show('Unable to submit. Please try again.');button.textContent=originalLabel;}
      finally{busy=false;button.disabled=false;}
    });
  }

})();
