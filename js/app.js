require.config({ baseUrl: 'js/lib',
    paths: {
        templates:'../tpl',
        data: '../data',
        jquery: 'jquery-1.10.2.min',
        sfapp: '../../sfapp'
    },
    shim: {
            "underscore-min": {
              exports: '_'
            }
        }
});

require(['jquery', 'underscore-min', 'text', 'handlebars', 'text!templates/form.handlebars', 'data/typeaheads', 'modernizr.min',
        'sfapp/js/bootstrap.min', 'sfapp/js/sfapp'],
function($, _, text, handlebars, form_src, typeaheads) {
    var fec_names, form_tpl, data_uri, subject_selector, candidate_check_selector;

    data_uri = 'js/data/example_data.json';
    subject_selector = 'select[name="advertisement_subject"]';
    candidate_check_selector = 'input[name=by_candidate]';
    form_tpl = Handlebars.compile(form_src);

    function trigger_form_changes () {
        $(subject_selector).change();
        $(candidate_check_selector).change();
    }

    function attach_typeaheads () {
        $('input[name=station_callsign]').typeahead({
            source: typeaheads.callsigns
        });

        $('input[name=committee_name]').typeahead({
            minLength: 2,
            source: function(query, callback) {
                callback(fec_names);
            }
        });

        $('input[name=office_sought]').typeahead({
            source: ["U.S. Senate", "U.S. House of Representatives", "President of the United States", "Governor of "]
        });
    }

    $(document).ready(function($) {
        // Display form
        $('#app').html(form_tpl);
        trigger_form_changes();
        attach_typeaheads();

        // Button for loading example data
        $(document).on('click', '#load_eg', function(event) {
            event.preventDefault();
            $('#app').fadeOut('slow', function() {
                $.getJSON(data_uri, function(json, textStatus, jqXHR) {
                    var compiled = form_tpl(json);
                    $('#app').html(compiled);
                    $('#app').fadeIn('slow', function() {
                        $('#advertisement_subject option').filter('[value='+ json.advertisement.subject + ']').prop('selected', true);
                        trigger_form_changes();
                    });
                });

            });
        });

        fec_names = _.keys(typeaheads.fec);
        /*
            Enable placeholders on browsers without native support
        */
        if (!Modernizr.input.placeholder) {
            $(this).find('[placeholder]').each(function()
            {
                if ($(this).val() === '') // if field is empty
                {
                    $(this).val( $(this).attr('placeholder') );
                }
            });
            $('[placeholder]').focus(function()
                {
                    if ($(this).val() == $(this).attr('placeholder'))
                    {
                        $(this).val('');
                        $(this).removeClass('placeholder');
                    }
                }).blur(function()
                {
                    if ($(this).val() === '' || $(this).val() == $(this).attr('placeholder'))
                    {
                        $(this).val($(this).attr('placeholder'));
                        $(this).addClass('placeholder');
                    }
                });

                // remove placeholders on submit
                $('[placeholder]').closest('form').submit(function()
                {
                    $(this).find('[placeholder]').each(function()
                    {
                        if ($(this).val() == $(this).attr('placeholder'))
                        {
                            $(this).val('');
                        }
                    });
                });
        }

        /*
            form#fcc_form stuff
        */
        $(document).on('change', subject_selector, function(evt) {
            var field_val = $(this).val();
            var el = $("#form_candidate_extras");
            var inputs = el.find('input').not('[type="checkbox"]');
            if (field_val == 'candidate') {
                inputs.attr('required', 'required');
                el.show();
            }
            else {
                inputs.attr('required', 'required');
                el.hide();
            }
        });
        $(document).on('change', candidate_check_selector, function(evt) {
            var checked = $(this).prop("checked");
            var el = $("#form_committee_details");
            var inputs = el.find('input').not('[type="checkbox"]');
            if (checked === true) {
                inputs.attr('required', 'required');
                el.show();
            }
            else {
                inputs.attr('required', 'required');
                el.hide();
            }
        });

        $(document).on('submit', '#fcc_form', function(event) {
            event.preventDefault();
            console.log("Submit form");
        });

    });
});

