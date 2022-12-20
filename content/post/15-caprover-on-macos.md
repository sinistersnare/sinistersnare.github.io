+++
slug = "caprover"
title = "Running CapRover"
description = "No one reads these anyways"
date = 2022-12-19T12:15:00-05:00
draft = true
[extra]
generate_toc = false
[taxonomies]
tags = ["Technology", "DevOps", "Engineering"]
+++

# What? #

I am testing out [CapRover](...) for work reasons. It may also be useful at home!
Lets find out.


# DigitalOcean

DigitalOcean provides $200 free credit for the first 2 months, so
I wanted to give it a go, before using it for work. And maybe this
will be useful on my home network too!

DO has a 'CapRover' droplet on their marketplace, but I wanted to do a bit
of the work myself to see how hard it is to do when not on DO. So, I used
the basic 'Docker' droplet from the Marketplace.


# On the machine #

After sshing into the machine, the [CapRover documentation](https://caprover.com/docs/get-started.html)
did the heavy lifting.

```
# Allow the ports CapRover needs
$ ufw allow 80,443,3000,996,7946,4789,2377/tcp; ufw allow 7946,4789,2377/udp;
# Start docker
$ docker run -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover
```

# Cloudflare #

I do my DNS via Cloudflare. Adding an entry for CapRover was super easy!
I just added an `A` record to `*.cap` (needs to be a wildcard for CapRover to work!)
that points to the public IP that DO gave me. I kept TTL as Auto, and waited a bit for
the changes to propagate.

Before the propagation though, work can continue!


# Sanity Check #

After the `docker run` finishes, wait about a minute, and go on `${PUBLICIP}:3000` on
your browser, and you will see that CapRover dashboard login. The default password
is `captain42`, but we will be changing that _very_ soon, don't worry.

The dashboard recommends using their `caprover` CLI instead of using the GUI configurator,
so I did that.

# Configuring the Instance #

```
npm i -g caprover
caprover serversetup
```

I filled out the questionnaire

1. 'Y', cause the server docker container is running
2. My public IP (minus any port of course)
3. `cap.davis.tools`
4. a password! ([I use `hunter2` but you will just see that as astericks.](http://bash.org/?244321))
5. An email address for the LetsEncrypt certificate
6. Finally, a machine name (I used `angbad`). This is only a local name, it *does not* change anything on the server, or the DNS.

Now I can access `captain.cap.davis.tools`

# Using a 1-click App #

I decided that I wanted to try out the 'Akaunting' app.

One thing that I do not like about these is that there is little help given in
deciding a docker tag to use, other than a link to the docker tag page.
I dont know these tools! And often, the versions given are not latest. For
Akaunting, it was a whole major version behind! And there are so many tags,
that I am unsure which would work best in this environment.

So I decided to try to use a tag for Akaunting 3. I deploy it, and I
see success! Yay! But then when I go to the page, a big `502 BAD GATEWAY`
flashes in front of me. Aghast!

The important thing is that the app name will be the subdomain used!
I used `money` as my app name.

Anyway, I filled out the form, and after a minutes or two, its up! Wow!

There is still more to do however, that I think would be great to put
in the configurator. I had to go to the configuration of the app,
and enable HTTPS, and then force HTTPS upgrading. I think that settings
like this should be shown at the initial screen.

After doing all of that, I can go to https://money.cap.davis.tools and there I have it!