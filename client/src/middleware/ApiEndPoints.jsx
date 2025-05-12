const serverDomain = import.meta.env.VITE_SERVER_DOMAIN;
console.log("Server Domain:", serverDomain);

const APIEndPoints = {
    sign_up: {
        url: `${serverDomain}/auth/signup`,
        method: 'post'
    },
    sign_in: {
        url: `${serverDomain}/auth/signin`,
        method: 'post'
    },
    sign_out: {
        url: `${serverDomain}/auth/signout`,
        method: 'get'
    },
    //dashboard
    get_dashboard_stats: {
        url: `${serverDomain}/user/dashboard-stats`,
        method: 'GET',
    },


    //user handling
    update_user: {
        url: `${serverDomain}/user/update`,
        method: 'post'
    },
    delete_user: {
        url: `${serverDomain}/user/delete`,
        method: 'delete'
    },
    get_all_users: {
        url: `${serverDomain}/user`,
        method: 'get'
    },

    //managers
    get_managers: {
        url: `${serverDomain}/user/managers`,
        method: 'get'
    },

    //teachers
    get_teachers: {
        url: `${serverDomain}/user/teachers`,
        method: 'get'
    },
    get_students: {
        url: `${serverDomain}/user/students`,
        method: 'get'
    },
    get_user: {
        url: `${serverDomain}/user`,
        method: 'get'
    },
    update_user_role: {
        url: `${serverDomain}/user/update-role`,
        method: 'post'
    },
    get_deleted_users: {
        url: `${serverDomain}/user/bin/deleted`,
        method: 'get'
    },
    restore_user: {
        url: `${serverDomain}/user/bin/restore`,
        method: 'put'
    },
    permanent_delete_user: {
        url: `${serverDomain}/user/bin/permanent`,
        method: 'delete'
    },
    clear_recycle_bin: {
        url: `${serverDomain}/user/bin/clear`,
        method: 'delete'
    },

    // upload
    image_upload: {
        url: `${serverDomain}/image/upload`,
        method: 'POST'
    },
    video_upload: {
        url: `${serverDomain}/image/upload-video`,
        method: 'POST'
    },
    create_subject: {
        url: `${serverDomain}/subjects`,
        method: 'POST'
    },
    get_subjects: {
        url: `${serverDomain}/subjects`,
        method: 'GET'
    },
    delete_subject: {
        url: `${serverDomain}/subjects`,
        method: 'DELETE'
    },
    get_deleted_subjects: {
        url: `${serverDomain}/subjects/delete`,
        method: 'GET'
    },
    restore_subject: {
        url: `${serverDomain}/subjects/restore`,
        method: 'POST'
    },
    permanent_delete_subject: {
        url: `${serverDomain}/subjects/permanent`,
        method: 'DELETE'
    },
    clear_subject_recycle_bin: {
        url: `${serverDomain}/subjects/recycle-bin/clear`,
        method: 'DELETE'
    },
    get_subject: {
        url: `${serverDomain}/subjects`,
        method: 'GET'
    },
    update_subject: {
        url: `${serverDomain}/subjects`,
        method: 'PUT'
    },
    download_video: {
        url: `${serverDomain}/subjects/download-video`,
        method: 'GET'
    },
    download_pdf: {
        url: `${serverDomain}/subjects/download-pdf`,
        method: 'GET'
    },
    create_assignment: {
        url: `${serverDomain}/assignment`,
        method: 'POST'
    },
    get_all_subjects_no_pagination: {
        url: `${serverDomain}/subjects/all`,
        method: 'GET'
    },
    upload_assignment_pdf: {
        url: `${serverDomain}/image/upload-pdf`,
        method: 'POST'
    },
    get_assignments_paginated: {
        url: `${serverDomain}/assignment/paginatedassignment`,
        method: 'GET',
    },
    delete_assignment: {
        url: `${serverDomain}/assignment`,
        method: 'DELETE',
    },
    get_deleted_assignments: {
        url: `${serverDomain}/assignment/bin/deleted`,
        method: 'GET',
    },
    restore_assignment: {
        url: `${serverDomain}/assignment/bin/restore`,
        method: 'PUT',
    },
    permanent_delete_assignment: {
        url: `${serverDomain}/assignment/bin/permanent`,
        method: 'DELETE',
    },
    clear_assignment_recycle_bin: {
        url: `${serverDomain}/assignment/bin/clear`,
        method: 'DELETE',
    },
    download_assignment: {
        url: `${serverDomain}/assignment/download`,
        method: 'get'
    },
    update_assignment: {
        url: `${serverDomain}/assignment`,
        method: 'put'
    },
    get_assignment: {
        url: `${serverDomain}/assignment`,
        method: 'get'
    },



    //requestForm
    request_form_create: {
        url: `${serverDomain}/request-form`,
        method: 'POST'
    },
    get_all_request_forms: {
        url: `${serverDomain}/request-form`,
        method: 'GET'
    },
    get_request_form: {
        url: `${serverDomain}/request-form`,
        method: 'GET'
    },
    update_request_form: {
        url: `${serverDomain}/request-form/update`,
        method: 'PUT'
    },
    delete_request_form: {
        url: `${serverDomain}/request-form/delete`,
        method: 'DELETE'
    },
    get_deleted_request_forms: {
        url: `${serverDomain}/request-form/bin/deleted`,
        method: 'GET'
    },
    restore_request_form: {
        url: `${serverDomain}/request-form/bin/restore`,
        method: 'PUT'
    },
    restore_all_request_forms: {
        url: `${serverDomain}/request-form/bin/restore-all`,
        method: 'PUT'
    },
    permanent_delete_request_form: {
        url: `${serverDomain}/request-form/bin/permanent`,
        method: 'DELETE'
    },
    clear_request_form_recycle_bin: {
        url: `${serverDomain}/request-form/bin/clear`,
        method: 'DELETE'
    },

    //notifications
    get_all_notifications: {
        url: `${serverDomain}/notifications`,
        method: 'GET'
    },
    create_notification: {
        url: `${serverDomain}/notifications/create`,
        method: 'POST'
    },
    get_notification: {
        url: `${serverDomain}/notifications/:id`,
        method: 'GET'
    },
    update_notification: {
        url: `${serverDomain}/notifications/:id`,
        method: 'PUT'
    },
    delete_notification: {
        url: `${serverDomain}/notifications/:id`,
        method: 'DELETE'
    },
    restore_notification: {
        url: `${serverDomain}/notifications/restore/:id`,
        method: 'PUT'
    },
    restore_all_notifications: {
        url: `${serverDomain}/notifications/restore-all`,
        method: 'PUT'
    },
    permanent_delete_notification: {
        url: `${serverDomain}/notifications/permanent-delete/:id`,
        method: 'DELETE'
    },
    delete_all_permanently: {
        url: `${serverDomain}/notifications/delete-all`,
        method: 'DELETE'
    },
    get_deleted_notifications: {
        url: `${serverDomain}/notifications/deleted`,
        method: 'GET'
    },
    get_monthly_request_forms: {
        url: `${serverDomain}/request-form/monthly-request-forms`,
        method: 'GET'
    },
    get_subject_stats: {
        url: `${serverDomain}/subjects/stats`,
        method: 'GET',
    },
    submit_assignment: {
        url: `${serverDomain}/submission`,
        method: 'GET',
    },
    create_submission: {
        url: `${serverDomain}/submission`,
        method: 'POST',
    },
} 


export default APIEndPoints;    