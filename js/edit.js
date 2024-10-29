/**
 * This script adds functions to scan for SEO errors and events to display them
 * on a post's edit page.
 */

jQuery(document).ready(function($){  
    // Define variables
    var images = new Array();
    var errors = {};
    var prefix = "aivey";
    var error_list = new Array();

    // List of possible error messages
    error_list['title_length'] = "Title is %TITLE_LENGTH% characters long. Keep titles at about 55 characters to prevent cutoff by search engines.";
    error_list['image_alt'] = 'The image "%IMAGE_FILE%" is missing alternative text.';
    error_list['image_alt_unknown'] = "One or more unidentified images are missing alternative text.";
    error_list['metadesc_length'] = 'The meta description is %METADESC_LENGTH% characters long. Try to keep meta descriptions around 150-160 characters.';
    error_list['metadesc_empty'] = 'Meta description has not been set.';
    
    /**
     * Check Title field for SEO errors and store them in array
     * 
     * @param {string} title
     * @returns {undefined}
     */
    $.checkTitle = function(title) {
        title = typeof title !== 'undefined' ? title : $("#title").val();
        
        if (title.length > 55) {
            errors['title_length'] = error_list['title_length'].replace("%TITLE_LENGTH%", title.length);
        } else if (typeof errors['title_length'] !== 'undefined'){
            $("#" + prefix + "_title_length").remove();
            delete errors['title_length'];
        }
    }
    
    /**
     * Check editor content for SEO errors and store them in array.
     * 
     * @param {string} content
     * @returns {undefined}
     */
    $.checkContent = function(content) {
        content = typeof content !== 'undefined' ? content : "<div>" + decodeHTML($("#content").val()) + "</div>";
        
        if (errors['image_alt_unknown']) {
            delete errors['image_alt_unknown'];
        }
        
        images = $("img", $(content));
        $.each(images, function() {
            var image_id;
            var image_file;
            
            if ($(this).attr('class') && $(this).attr('class').match(/wp-image-([0-9]+)/i)) {
                image_id = $(this).attr('class').match(/wp-image-([0-9]+)/i)[1];
            } else if (!errors['image_alt_unknown']
                    && (typeof $(this).attr('alt') === 'undefined' 
                    || $(this).attr('alt').length === 0)) {
                errors['image_alt_unknown'] = error_list['image_alt_unknown'];
            }
            
            if ($(this).attr('src') && $(this).attr('src').match(/.*\/([a-z0-9\-]+\.[a-z]{3,4})/i)) {
                image_file = $(this).attr('src').match(/.*\/([a-z0-9\-]+\.[a-z]{3,4})/i)[1];
            }
    
            

            if (typeof image_id !== 'undefined' && typeof image_file !== 'undefined' && (typeof $(this).attr('alt') === 'undefined' || $(this).attr('alt').length === 0)) {
                errors["image_alt_" + image_id] = error_list['image_alt'].replace("%IMAGE_FILE%", image_file);
            } else if (image_id && errors['image_alt_' + image_id]){
                $("#" + prefix + "_image_alt_" + image_id).remove();
                delete errors['image_alt_' + image_id];
            }
        });
    }
    
    /**
     * Check Meta Description field for SEO errors and store them in array.
     * 
     * @param {string} metadesc
     * @returns {undefined}
     */
    $.checkMetaDesc = function(metadesc) {
        metadesc = typeof metadesc !== 'undefined' ? metadesc : $("#aivey-seo-metadesc").val();
        
        if (metadesc.length > 160 || (metadesc.length < 150 && metadesc.length > 0)) {
            errors['metadesc_length'] = error_list['metadesc_length'].replace("%METADESC_LENGTH%", metadesc.length);
        } else if (typeof errors['metadesc_length'] !== 'undefined'){
            $("#" + prefix + "_metadesc_length").remove();
            delete errors['metadesc_length'];
        }
        
        if (metadesc.length === 0) {
            errors['metadesc_empty'] = error_list['metadesc_empty'];
        } else if (typeof errors['metadesc_empty'] !== 'undefined'){
            $("#" + prefix + "_metadesc_empty").remove();
            delete errors['metadesc_empty'];
        }
    }
    
    /**
     * Build error list with HTML and place it within the error element.
     * 
     * @returns {undefined}
     */
    $.refreshErrors = function() {
        var html = "";

        html = '<ul id="' + prefix + '-seo-error-list">';

        $.each(errors, function(index, value){
            html += '<li id="' + prefix + '_' + index + '">' + value + '</li>';
        });

        html += "</ul>";

        $("#" + prefix + "-seo-errors").html(html);
    }
    
    /**
     * Decode encoded HTML by placing it in a textarea element and retrieving it's value
     * 
     * @param {string} encodedHTML
     * @returns {string}
     */
    function decodeHTML(encodedHTML) {
        var textarea = document.createElement('textarea');
        textarea.innerHTML = encodedHTML;
        return textarea.value;
    }
    
    // Check Title on keyup.
    $("#title").keyup(function(){
        $.checkTitle();
        $.refreshErrors();
    });
    
    // Check editor content on keyup.
    $("#content").on("keyup", function(){
        $.checkContent();
        $.refreshErrors();
    });
    
    // Check Meta Description on keyup.
    $("#aivey-seo-metadesc").on("keyup", function(){
        $.checkMetaDesc();
        $.refreshErrors();
    });
    
    // Check each field once the page loads.
    $.checkTitle();
    $.checkContent();
    $.checkMetaDesc();
    $.refreshErrors();
});