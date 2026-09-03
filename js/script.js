/* ==========================================================================
   Sonika Gupta — Portfolio interactions
   ========================================================================== */
(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks){
    navToggle.addEventListener('click', function(){
      var isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll progress bar + back-to-top ---------- */
  var progress = document.getElementById('scrollProgress');
  var toTop = document.getElementById('toTop');
  function updateProgress(){
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progress) progress.style.width = pct + '%';
    if (toTop) toTop.classList.toggle('show', scrollTop > 700);
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
  if (toTop){
    toTop.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Hero cursor tag (design-tool cursor feel) ---------- */
  var hero = document.getElementById('home');
  var cursorTag = document.getElementById('cursorTag');
  if (hero && cursorTag && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    var raf = null;
    hero.addEventListener('mousemove', function(e){
      var rect = hero.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function(){
        cursorTag.style.left = (x + 18) + 'px';
        cursorTag.style.top = (y + 18) + 'px';
        cursorTag.classList.add('show');
      });
    });
    hero.addEventListener('mouseleave', function(){
      cursorTag.classList.remove('show');
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if ('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
          if (entry.target.hasAttribute('data-reveal') === false) return;
          if (entry.target.querySelector('.bar-fill')){
            animateBars(entry.target);
          }
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });

    // Skill bars live inside a sibling reveal container, observe that too
    var skillsGroup = document.querySelector('.skills-groups');
    if (skillsGroup){
      var ioSkills = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){
            animateBars(entry.target);
            ioSkills.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      ioSkills.observe(skillsGroup);
    }
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
    document.querySelectorAll('.bar-fill').forEach(function(bar){
      bar.style.width = bar.getAttribute('data-fill') + '%';
    });
  }

  function animateBars(container){
    var bars = container.querySelectorAll('.bar-fill');
    bars.forEach(function(bar){
      var val = bar.getAttribute('data-fill') || '0';
      requestAnimationFrame(function(){
        bar.style.width = val + '%';
      });
    });
  }

  /* ---------- Contact form validation (front-end only) ---------- */
  var form = document.getElementById('contactForm');
var success = document.getElementById('formSuccess');

if (form){
  var submitBtn = form.querySelector('.form-submit');

  function encode(data) {
    return Object.keys(data)
      .map(function(key){ return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]); })
      .join("&");
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('name');
    var email = document.getElementById('email');
    var message = document.getElementById('message');
    var valid = true;

    valid = validateField(name, name.value.trim().length > 0) && valid;
    valid = validateField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) && valid;
    valid = validateField(message, message.value.trim().length > 3) && valid;

    if (!valid){
      if (success) success.classList.remove('show');
      return;
    }

    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        "form-name": "contact",
        name: name.value.trim(),
        email: email.value.trim(),
        message: message.value.trim()
      })
    })
    .then(function(response){
      if (response.ok){
        success.classList.add('show');
        form.reset();
        setTimeout(function(){ success.classList.remove('show'); }, 6000);
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .catch(function(error){
      console.error('Form submission error:', error);
      alert('Something went wrong. Please email me directly at gsonika469@gmail.com');
    })
    .finally(function(){
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  });

  [['name','fieldName'], ['email','fieldEmail'], ['message','fieldMessage']].forEach(function(pair){
    var input = document.getElementById(pair[0]);
    if (input){
      input.addEventListener('input', function(){
        document.getElementById(pair[1]).classList.remove('invalid');
      });
    }
  });
}

  function validateField(input, isValid){
    var wrap = input.closest('.field');
    if (wrap) wrap.classList.toggle('invalid', !isValid);
    return isValid;
  }

})();
