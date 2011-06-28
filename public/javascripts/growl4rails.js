var growl4rails_instance_count = 0;
var growl4rails_current_showing = 0;
var growl4rails_queue = [];
var growl4rails_limit_reached = false;
var growl4rails_timer_hash = [];

//pre-load images:
var growl4rails_images = ['body','bottom','corner_ll','corner_lr','corner_ul','corner_ur','top'];
$.each(growl4rails_images, function(index, img) {
  ext = '.png';
  if ($.browser.msie && navigator.userAgent.match(/MSIE [456]/)) {
    ext = '.gif';
  }
  var loadingImg = new Image();
  loadingImg.src = '/images/growl4rails/' + img + ext;
  
  var loadingHiImg = new Image();
  loadingHiImg.src = '/images/growl4rails/' + img + '_hi' + ext;
});

var Growl4Rails = $.klass({ });

Growl4Rails.showGrowl = function(arguments) {
  //if we're not showing maximum number of growls then show it, otherwise queue it up
  if(growl4rails_current_showing >= growl4rails_max_showing)
    growl4rails_limit_reached = true;
  
  //generate a unique id for this growl
  var growl_cell_id = arguments.growl_id;
  
  if(growl_cell_id == undefined)
    growl_cell_id = 'growl4rails_cell_' + (growl4rails_instance_count++);
    
  if(!growl4rails_limit_reached) {
    growl4rails_current_showing++;
    
    //add it to the document
    
    //IE6 PNG fix for icons
    var img_path = arguments.image_path;

    var is_png = (img_path.substring(img_path.length-3, img_path.length).toUpperCase() == "PNG")
    var img_style = 'background-image:url(' + img_path + ');background-repeat: no-repeat;';
    if ($.browser.msie && navigator.userAgent.match(/MSIE [456]/) && is_png) {
      img_style = 'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + img_path + '\');';
    }
    var data = {
      id:growl_cell_id, 
      title: arguments.title,
      img_style:img_style, 
      message: arguments.message
    };
    
    //get the other growls before we add this one so we can position
    var other_growls = $('.growl4rails_cell');
    var growlHTML = '<div id="' + data.id + '" class="growl4rails_cell" style="display:none;">\
    <table cellspacing="0" cellpadding="0">\
      <thead>\
        <tr>\
          <td><div class="growl4rails_corner_ul" id="growl4rails_close"></div></td>\
          <td><div class="growl4rails_top"></div></td>\
          <td><div class="growl4rails_corner_ur"></div></td>\
        </tr>\
      </thead>\
      <tbody>\
        <tr>\
          <td colspan="3">\
            <div class="growl4rails_body" id="growl4rails_body_' + data.id + '"></div>\
          </td>\
        </tr>\
      </tbody>\
      <thead>\
        <tr>\
          <td><div class="growl4rails_corner_ll"></div></td>\
          <td><div class="growl4rails_bottom"></div></td>\
          <td><div class="growl4rails_corner_lr"></div></td>\
        </tr>\
      </thead>\
    </table>\
    </div>\
    <div id="growl4rails_info_' + data.id + '" class="growl4rails_info" style="display:none;">\
      <div class="growl4rails_image" style="' + data.img_style + '"></div>\
      <div class="growl4rails_title">' + data.title + '</div>\
      <div class="growl4rails_message">' + data.message + '<div>\
    </div>';
    
    $(document.body).append(growlHTML);
    
    //position the growl
    var top_offset = 0;
    var left_offset = document.viewport.getWidth() - 400;
    $('#' + growl_cell_id).css('left', left_offset + 'px');
    
    if(other_growls.length > 0) {
      var top_position = 0;
      $.each(other_growls, function(index, growl) {
        top_position += $(growl).height();
      });
      top_offset = document.viewport.getScrollOffsets().top + top_position + 10;
    } else {
      top_offset = document.viewport.getScrollOffsets().top + 10;
    }
    $('#' + growl_cell_id).css('top', top_offset + 'px');
    
    //position the text and image
    $('#growl4rails_info_' + growl_cell_id).css('top', (top_offset + 28) + 'px');
    $('#growl4rails_info_' + growl_cell_id).css('left', left_offset + 28 + 'px');
  
    //wire up the growl mouse events
    $('#' + growl_cell_id).mouseover(Growl4Rails.mouseOver);
    $('#' + growl_cell_id).mouseout(Growl4Rails.mouseOut);
    $('#' + growl_cell_id).click(Growl4Rails.click);
    $('#growl4rails_info_' + growl_cell_id).click(Growl4Rails.click);
    
    //Temporary until we've got better support for opacity and alpha transparency
    if($.browser.msie) {
      $('#growl4rails_info_' + growl_cell_id).show();
      $('#' + growl_cell_id).show();
    } else {  
      $('#growl4rails_info_' + growl_cell_id).fadeIn();
      $('#' + growl_cell_id).fadeIn();
    }
    
    $('#growl4rails_body_' + growl_cell_id).css('height', ($('#growl4rails_info_' + growl_cell_id).height() - 20) + 'px');
    
    //set it up to disappear
    var timer = setTimeout("Growl4Rails.hideGrowl('" + growl_cell_id + "')", growl4rails_duration);
    growl4rails_timer_hash[growl_cell_id] = timer;
  } else {
    growl4rails_queue.push({
      growl_id:growl_cell_id, 
      image_path:arguments.image_path, 
      title:arguments.title, 
      message:arguments.message
    });
    
  }
  return growl_cell_id;
}

Growl4Rails.hideGrowl = function(growl_cell_id) {
  growl4rails_timer_hash[growl_cell_id] = null;
  if($.browser.msie) {
    if($('#growl4rails_info_' + growl_cell_id).length)
      $('#growl4rails_info_' + growl_cell_id).hide();
    
    if($('#' + growl_cell_id).length)
      $('#' + growl_cell_id).hide();
  } else {
    if($('#growl4rails_info_' + growl_cell_id).length)
      $('#growl4rails_info_' + growl_cell_id).fadeOut(1*1000);
    
    if($('#' + growl_cell_id).length)
      $('#' + growl_cell_id).fadeOut(1*1000);
  }
    
  setTimeout("Growl4Rails.removeGrowl('" + growl_cell_id + "')", 1000);
};

Growl4Rails.removeGrowl = function(growl_cell_id) {
  growl4rails_current_showing--;
  if($('#growl4rails_info_' + growl_cell_id).length)
    $('#growl4rails_info_' + growl_cell_id).remove();
    
  if($('#' + growl_cell_id).length)
    $('#' + growl_cell_id).remove();
  
  //if this is the last growl, fire an event so we can show more, if there are any
  if(growl4rails_current_showing == 0) {
    growl4rails_limit_reached = false;
    $(document).trigger('growl4rails:lastgrowlshown');
  }
};

var mouseOverClasses = ['growl4rails_corner_ul', 'growl4rails_top', 'growl4rails_corner_ur', 
          'growl4rails_body', 'growl4rails_corner_ll', 'growl4rails_bottom', 'growl4rails_corner_lr'];

Growl4Rails.mouseOver = function(event) {
  //bunch of hoo-ha to make sure we're not handling bubbled mouseover events.
  var relatedTarget = event.relatedTarget;
  var currentTarget = event.currentTarget ? event.currentTarget : event.srcElement;
  if (relatedTarget && relatedTarget.nodeType == Node.TEXT_NODE) relatedTarget = relatedTarget.parentNode;   
  
  if (relatedTarget && relatedTarget != currentTarget && $(currentTarget).find(relatedTarget).length == 0 && !$(relatedTarget).parents().hasClass('growl4rails_info')) {
    growl_cell = Growl4Rails.findGrowlIdByDescendant(event.target);
    $.each(mouseOverClasses, function(index, item) {
     $('#' + growl_cell.id + ' .' + item).addClass(item + '_hi');
    });
    timer = growl4rails_timer_hash[growl_cell.id];
    clearTimeout(timer);
  }
};

Growl4Rails.mouseOut = function(event) {
  //bunch of hoo-ha to make sure we're not handling bubbled mouseover events.
  var relatedTarget = event.relatedTarget;
  var currentTarget = event.currentTarget ? event.currentTarget : event.srcElement;
  if (relatedTarget && relatedTarget.nodeType == Node.TEXT_NODE) relatedTarget = relatedTarget.parentNode;   
  
  if (relatedTarget && relatedTarget != currentTarget && $(currentTarget).find(relatedTarget).length == 0 && !$(relatedTarget).parents().hasClass('growl4rails_info')) {
    growl_cell = Growl4Rails.findGrowlIdByDescendant(event.target);
    $.each(mouseOverClasses, function(index, item) {
     $('#' + growl_cell.id + ' .' + item).removeClass(item + '_hi');
    });
    var timer = setTimeout("Growl4Rails.hideGrowl('" + growl_cell.id + "')", growl4rails_duration);
    growl4rails_timer_hash[growl_cell.id] = timer;
  }
};

Growl4Rails.click = function(event) {
  var element = event.target;
  var growl_cell = Growl4Rails.findGrowlIdByDescendant(element);
  Growl4Rails.hideGrowl(growl_cell.id);
  if(element.id != 'growl4rails_close')
    $(growl_cell).trigger(growl_cell.id + ':clicked');
};

Growl4Rails.findGrowlIdByDescendant = function(descendant) {
  //Thanks IE!!!
  if(descendant.className == 'growl4rails_cell')
    return descendant;
    
  var growl_cell = $(descendant).parents('.growl4rails_cell')[0];
  if(!growl_cell) {
    var growl_info = $(descendant).parents('.growl4rails_info');
    
    if(growl_info.length)
      growl_cell = $('#' + growl_info[0].id.substring('growl4rails_info_'.length))[0];
  }
  return growl_cell
};

$(document).bind('growl4rails:lastgrowlshown', function(event) {
  var i = 0;
  while(growl4rails_queue.length != 0 && i < growl4rails_max_showing) {
    Growl4Rails.showGrowl(growl4rails_queue.shift());
    i++;
  }
});

//Patch for getDimensions where parent is hidden, therefore can't get child dimensions:
// Element.addMethods({
//   getDimensionsPatched: function (element) { 
//       // element = $(element);
//       var dimensions = {width: element.clientWidth, height: element.clientHeight}; 
// 
//       if ((dimensions.width || dimensions.height) == 0) { 
//         // All *Width and *Height properties give 0 on elements with display none, 
//         // or when ancestors have display none, so enable those temporarily 
//         var restore = element.ancestors(function(element) { return !element.visible() }), 
//         styles = []; 
//         restore.push(element); 
// 
//         $.each(restore, function(index, r) { 
//           styles.push({ 
//             display: r.getStyle('display'), 
//             position: r.getStyle('position'), 
//             visibility: r.getStyle('visibility') 
//           }); 
//           r.setStyle({display: 'block', position: 'absolute', visibility: 'visible'}); 
//         }); 
// 
//         dimensions = {width: element.clientWidth, height: element.clientHeight}; 
//         $.each(restore, function(index, r) { 
//           r.setStyle(styles[index]); 
//         }); 
//       } 
//       return dimensions;         
//   }//getDimensions
// });
