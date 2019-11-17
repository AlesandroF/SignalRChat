﻿using Microsoft.AspNetCore.SignalR;
using SignalRChat.Domain.Features.Annotations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChat.API.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(Annotation annotation)
        {
            await Clients.All.SendAsync("sendMessage", annotation);
        }
    }
}