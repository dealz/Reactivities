using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Application.Activities;

namespace Application.Profiles
{
    public class UserActivityDto
    {
        public Guid Id { get; set; }

        public string Title { get; set; }
        public string Category { get; set; }

        public DateTime Date { get; set; }

        [JsonIgnore]
        public string HostUserName { get; set; }



    }



}