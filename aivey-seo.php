<?php
/**
 * Plugin Name: Aivey SEO 
 * Plugin URI: http://alexjivey.com
 * Description: Analyze posts in real-time to ensure the best SEO practices are implemented.
 * Version: 1.0 Alpha
 * Author: Alex Ivey
 * Author URI: http://alexjivey.com
 * License: GPL2
 */

define("AIVEY_SEO_VERSION", "1.0a");
define("AIVEY_SEO_ROOT", dirname(__FILE__));
define("AIVEY_SEO_URL", plugins_url('/', __FILE__ ));

/*
 * Add Meta Description field
 */

add_action('admin_menu', 'aivey_seo_metadesc_create');

function aivey_seo_metadesc_create() {
    add_meta_box('aivey-seo-metadesc-box', 'Aivey SEO Meta Description', 'aivey_seo_metadesc', 'post', 'normal', 'high');
    add_meta_box('aivey-seo-metadesc-box', 'Aivey SEO Meta Description', 'aivey_seo_metadesc', 'page', 'normal', 'high');
}

function aivey_seo_metadesc($post, $box) {
    $metadesc_content = esc_html(get_post_meta($post->ID, 'aivey-seo-metadesc', true));
    $metadesc_nonce = wp_create_nonce(plugin_basename(__FILE__));
    include(dirname(__FILE__) . DIRECTORY_SEPARATOR . "view" . DIRECTORY_SEPARATOR . "edit-form-metadesc.php");
}

add_action('wp_head', 'aivey_seo_metadesc_head');

function aivey_seo_metadesc_head() {
    global $post;
    if (!empty($post)) {
        $metadesc = esc_html(get_post_meta($post->ID, 'aivey-seo-metadesc', true));  
        echo '<meta name="description" content="' . $metadesc . '" />';
    }
}

if( 'post.php' == $pagenow || "post-new.php" == $pagenow) {
    add_action('save_post', 'aivey_seo_save_metadesc');

    function aivey_seo_save_metadesc($post_id, $post) {
        //if ($post->post_type == "post") {
            if (!wp_verify_nonce(filter_input(INPUT_POST, "aivey-seo-metadesc-nonce"), plugin_basename(__FILE__))){
                return $post_id;
            }
            if (!current_user_can('edit_post', $post_id)) {
                return $post_id;
            }

            $old_value = get_post_meta($post_id, 'aivey-seo-metadesc', true);
            $new_value = stripslashes(filter_input(INPUT_POST, 'aivey-seo-metadesc'));

            if (strlen($new_value) > 0 && $new_value != $old_value) {
                update_post_meta($post_id, 'aivey-seo-metadesc', $new_value);
            } else if ('' == $new_value) {
                delete_post_meta($post_id, 'aivey-seo-metadesc');
            }
       // }
    }
}

/*
 * Add SEO scripts and styles
 */

add_action('admin_enqueue_scripts', 'aivey_seo_enqueue');

function aivey_seo_enqueue() {
    global $pagenow, $aivey_seo_version;
    if( 'post.php' == $pagenow || "post-new.php" == $pagenow) {
        wp_enqueue_script('aivey-seo-edit', AIVEY_SEO_URL . "js/edit.js", array(), AIVEY_SEO_VERSION);
        wp_enqueue_style('aivey-seo-edit', AIVEY_SEO_URL . "css/edit.css", array(), AIVEY_SEO_VERSION);
    }
}

/*
 * Add SEO analysis and reporting 
 */

add_action('edit_form_after_editor', 'aivey_seo_after_editor', 10, 1);

function aivey_seo_after_editor($post) {
    if ($post->post_type == "post" || $post->post_type == "page") {
        include(AIVEY_SEO_ROOT . DIRECTORY_SEPARATOR . "view" . DIRECTORY_SEPARATOR . "edit-form-errors.php");
    }
}

/*
 * Add TinyMCE SEO content check plugin
 */

add_filter('init', 'aivey_seo_tinymce_init');

function aivey_seo_tinymce_init() {
    add_filter('mce_external_plugins', 'aivey_seo_tinymce');
}


function aivey_seo_tinymce($init) {
    $init['keyup_event'] = plugins_url() . "/aivey-seo/js/tinymce.js"; //plugins_url("/js/tinymce.js", __FILE__);
    return $init;
}

?>