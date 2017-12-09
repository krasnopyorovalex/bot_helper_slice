(function () {

    var boxUsers = jQuery('.body__box-users'),
        adminAvatar = 'admin.jpg',
        starIcon = jQuery('.header__box-sb-r .fa-star'),
        boxDialog = jQuery('.body__box-dialog'),
        storeMessages,
        loading = function () {
            return boxDialog.toggleClass('loading');
        },
        reloadMessages = function (userId) {
            var messages = '', message, image;
            if(storeMessages && userId){
                for(message in storeMessages[userId]['messages']){
                    image = (parseInt(storeMessages[userId]['messages'][message]['is_answer'])
                        ? adminAvatar
                        : storeMessages[userId]['image']);
                    messages += '<li>'+
                                    '<div class="body__box-dialog-avatar">'+
                                        '<img alt="ava" src="/images/'+image+'">'+
                                    '</div>'+
                                    '<div class="body__box-dialog-text">' + storeMessages[userId]['messages'][message]['message'] + '</div>'+
                                '</li>';
                }
                boxDialog.find('ul').html(messages);
            }
        },
        loadUsers = function (userId) {
            if(storeMessages){
                var user, users = '';
                for (user in storeMessages){
                    var isFavorite = (parseInt(storeMessages[user]['is_favorite']) ? 'is_favorites' : ''),
                        active = (user == userId) ? ' active' : '',
                        status = (parseInt(storeMessages[user]['status'])
                            ? '<div class="user__message-status-new"><i class="fa fa-circle" aria-hidden="true"></i></div>'
                            : '');
                    users += '<li data-user="'+user+'" class="'+isFavorite+active+'">'+
                        '<img src="images/'+storeMessages[user]['image']+'" alt="ava">'+
                        '<div class="user__body">'+
                        '<div class="user__name">'+storeMessages[user]['name']+'<i class="fa fa-star" aria-hidden="true"></i></div>'+
                        '<div class="user__last-message">'+storeMessages[user]['last_message']+'</div>'+
                        '<div class="user__message-time">'+storeMessages[user]['time']+'</div>'+status+
                        '</div>'+
                        '</li>';
                }
                boxUsers.find('ul').html(users);
            }
        },
        loadDialog = function () {
            var userId = parseInt(boxUsers.find('li.active').attr('data-user'));
            jQuery.ajax({
                url: '/get-messages',
                method: 'post',
                dataType: 'json',
                data: {'userId': parseInt(userId)},
                beforeSend: function () {
                  return loading();
                },
                success: function(data){
                    storeMessages = data;
                    reloadMessages(userId);
                    loadUsers(userId);
                    return loading();
                }
            });
        };

    boxUsers.on('click', 'li', function () {
        var _this = jQuery(this),
            userId = parseInt(_this.attr('data-user'));
        _this.closest('ul').find('li').removeClass('active');
        if(_this.hasClass('is_favorites')){
            starIcon.addClass('active');
        } else {
            starIcon.removeClass('active');
        }
        _this.find('.user__message-status-new').remove();
        _this.addClass('active');
        return reloadMessages(userId);
    });

    starIcon.on('click', function () {
        var _this = jQuery(this),
            userActive = boxUsers.find('li.active'),
            userId = parseInt(userActive.attr('data-user'));
        if(userId) {
            userActive.toggleClass('is_favorites');
            jQuery.ajax({
                url: '/set-favorite',
                method: 'post',
                data: {
                    'userId': userId,
                    'is_favorite': (userActive.hasClass('is_favorites') ? 1 : 0)
                },
                success: function () {
                    return _this.toggleClass('active');
                }
            });
        }
        return true;
    });

    loadDialog();
    setInterval(loadDialog, 10000);
})();