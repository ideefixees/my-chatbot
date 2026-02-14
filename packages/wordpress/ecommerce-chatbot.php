<?php
/**
 * Plugin Name: Ecommerce Chatbot
 * Description: A powerful AI chatbot for WooCommerce.
 * Version: 1.0.0
 * Author: Ai Bot Team
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Add Settings Menu
function ec_chatbot_add_admin_menu() {
    add_options_page(
        'Ecommerce Chatbot Settings',
        'Chatbot',
        'manage_options',
        'ec-chatbot',
        'ec_chatbot_options_page'
    );
}
add_action('admin_menu', 'ec_chatbot_add_admin_menu');

// 2. Register Settings
function ec_chatbot_settings_init() {
    register_setting('ec_chatbot_plugin', 'ec_chatbot_settings');

    add_settings_section(
        'ec_chatbot_plugin_section',
        __('API Configuration', 'ec-chatbot'),
        'ec_chatbot_settings_section_callback',
        'ec_chatbot_plugin'
    );

    add_settings_field(
        'ec_chatbot_api_url',
        __('Chat API URL', 'ec-chatbot'),
        'ec_chatbot_api_url_render',
        'ec_chatbot_plugin',
        'ec_chatbot_plugin_section'
    );

    add_settings_field(
        'ec_chatbot_shop_id',
        __('Shop ID', 'ec-chatbot'),
        'ec_chatbot_shop_id_render',
        'ec_chatbot_plugin',
        'ec_chatbot_plugin_section'
    );
}
add_action('admin_init', 'ec_chatbot_settings_init');

function ec_chatbot_settings_section_callback() {
    echo __('Enter your Chatbot API details below.', 'ec-chatbot');
}

function ec_chatbot_api_url_render() {
    $options = get_option('ec_chatbot_settings');
    ?>
    <input type='text' name='ec_chatbot_settings[ec_chatbot_api_url]' value='<?php echo isset($options['ec_chatbot_api_url']) ? $options['ec_chatbot_api_url'] : ''; ?>' style="width: 400px;">
    <?php
}

function ec_chatbot_shop_id_render() {
    $options = get_option('ec_chatbot_settings');
    ?>
    <input type='text' name='ec_chatbot_settings[ec_chatbot_shop_id]' value='<?php echo isset($options['ec_chatbot_shop_id']) ? $options['ec_chatbot_shop_id'] : ''; ?>'>
    <?php
}

function ec_chatbot_options_page() {
    ?>
    <form action='options.php' method='post'>
        <h2>Ecommerce Chatbot Settings</h2>
        <?php
        settings_fields('ec_chatbot_plugin');
        do_settings_sections('ec_chatbot_plugin');
        submit_button();
        ?>
    </form>
    <?php
}

// 3. Enqueue Script on Frontend
function ec_chatbot_enqueue_script() {
    $options = get_option('ec_chatbot_settings');
    $api_url = isset($options['ec_chatbot_api_url']) ? $options['ec_chatbot_api_url'] : '';
    $shop_id = isset($options['ec_chatbot_shop_id']) ? $options['ec_chatbot_shop_id'] : '';

    if (empty($api_url)) {
        return; // Don't load if not configured
    }

    // Load the script from the remote URL (or local plugin file)
    // NOTE: For now, we assume the user will copy the built JS to the plugin folder OR use a CDN.
    // For this demo, let's assume we bundle the JS with the plugin.
    
    wp_enqueue_script('ec-chatbot-widget', plugin_dir_url(__FILE__) . 'assets/chatbot-widget.iife.js', [], '1.0.0', true);

    // Pass configuration to JS
    wp_add_inline_script('ec-chatbot-widget', '
        window.ChatbotConfig = {
            apiUrl: "' . esc_url($api_url) . '",
            shopId: "' . esc_js($shop_id) . '"
        };
    ', 'before');
}
add_action('wp_enqueue_scripts', 'ec_chatbot_enqueue_script');
