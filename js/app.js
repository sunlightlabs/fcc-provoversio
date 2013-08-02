require.config({ baseUrl: 'js/lib',
    paths: {
        templates:'../templates',
        data: '../data',
        jquery: 'jquery-1.10.2.min',
        sfapp: '../../sfapp'
    }
});

require(['jquery', 'text', 'handlebars', 'data/typeaheads', 'modernizr.min',
        'sfapp/js/bootstrap.min', 'sfapp/js/sfapp'],
function($, text, handlebars, typeaheads) {
    $(document).ready(function($) {
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
        $('#advertisement_subject').change(function(evt) {
            var field_val = $(this).val();
            var el = $("#form_candidate_extras");
            var inputs = el.find('input').not('[type="checkbox"]');
            if (field_val == 'candidate') {
                console.log('what');
                inputs.attr('required', 'required');
                el.show();
            }
            else {
                inputs.attr('required', 'required');
                el.hide();
            }
        });
        $('#advertisement_subject').change();
        $('input[name=by_candidate]').change(function(evt) {
            var checked = $(this).prop("checked");
            var el = $("#form_committee_details");
            var inputs = el.find('input').not('[type="checkbox"]');
            if (checked == true) {
                inputs.attr('required', 'required');
                el.show();
            }
            else {
                inputs.attr('required', 'required');
                el.hide();
            }
        });
       $('input[name=by_candidate]').change();

        $('input[name=station_callsign]').typeahead({
            source: typeaheads.callsigns
        });

        /*
            Form submission
        */
        $('#fcc_form').submit(function(evt) {
            console.log("Form submitted");
            evt.preventDefault();
            return false;
        });
    });
});

