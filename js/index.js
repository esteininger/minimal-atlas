var baseURL = `https://webhooks.mongodb-realm.com/api/client/v2.0/app/atlasconfigurator-xyznk/service/Atlas/incoming_webhook`
var instances = [
  {
    "instance_size": "M2",
    "default_storage": "2 GB",
    "default_ram": "Shared"
  },
  {
    "instance_size": "M5",
    "default_storage": "5 GB",
    "default_ram": "Shared"
  },
  {
    "instance_size": "M10",
    "default_storage": "10 GB",
    "default_ram": "1.7 GB"
  },
  {
    "instance_size": "M20",
    "default_storage": "20 GB",
    "default_ram": "3.8 GB"
  },
  {
    "instance_size": "M30",
    "default_storage": "40 GB",
    "default_ram": "7.5 GB"
  },
  {
    "instance_size": "M40",
    "default_storage": "80 GB",
    "default_ram": "15 GB"
  },
  {
    "instance_size": "M40 Low-CPU (R40) 2",
    "default_storage": "80 GB",
    "default_ram": "16 GB"
  },
  {
    "instance_size": "M50",
    "default_storage": "160 GB",
    "default_ram": "30 GB"
  },
  {
    "instance_size": "M50 Low-CPU (R50) 2",
    "default_storage": "160 GB",
    "default_ram": "32 GB"
  },
  {
    "instance_size": "M60",
    "default_storage": "320 GB",
    "default_ram": "60 GB"
  },
  {
    "instance_size": "M60 Low-CPU (R60) 2",
    "default_storage": "320 GB",
    "default_ram": "64 GB"
  },
  {
    "instance_size": "M80",
    "default_storage": "750 GB",
    "default_ram": "120 GB"
  },
  {
    "instance_size": "M80 Low-CPU (R80) 2",
    "default_storage": "750 GB",
    "default_ram": "128 GB"
  },
  {
    "instance_size": "M200",
    "default_storage": "1500 GB",
    "default_ram": "240 GB"
  },
  {
    "instance_size": "M200 Low-CPU (R200) 2",
    "default_storage": "1500 GB",
    "default_ram": "256 GB"
  },
  {
    "instance_size": "M300 1",
    "default_storage": "2000 GB",
    "default_ram": "360 GB"
  },
  {
    "instance_size": "M300 Low-CPU (R300) 2",
    "default_storage": "2000 GB",
    "default_ram": "384 GB"
  },
  {
    "instance_size": "M400 Low-CPU (R400) 2",
    "default_storage": "3000 GB",
    "default_ram": "512 GB"
  },
  {
    "instance_size": "M400 Low-CPU (R600) 2",
    "default_storage": "4096 GB",
    "default_ram": "640 GB"
  }
]


function grabInstance(instanceName) {
  return $.map(instances, function(e, i) {
    if (e.instance_size === instanceName) return e;
  });
}


function loadClusters() {
  $.ajax({
      url: `${baseURL}/getClusters`
    }).done(function(clusters) {
      renderClusters(clusters)
    })
    .fail(function(err) {
      console.log(err)
    });
}

function renderClusters(clusters) {
  var placeholder = $('#placeholder');
  // empty
  placeholder.html("");
  // let html = ``;
  console.log(clusters)
  $.each(clusters, function(index, cluster) {

    let instance = grabInstance(cluster.providerSettings.instanceSizeName)[0];

    let html = `
    <div class="col-md-4 cluster-box" data-id="${cluster.id}">
      <div class="tile">
        <div class="wrapper">
          <div class="header">${cluster.name} </div>

          <div class="banner-img">
            <div class="form-group row">
              <div class="col-sm-12">
                <input class="form-control" value="${(cluster.connectionStrings.standardSrv === undefined) ? "connection string waiting..." : cluster.connectionStrings.standardSrv}">
              </div>
            </div>
          </div>



          <div class="dates">
            <div class="start">
              <strong>STATE</strong> ${cluster.stateName}
              <span></span>
            </div>
            <div class="ends">
              <strong>INSTANCE</strong> ${cluster.providerSettings.instanceSizeName}
            </div>
          </div>

          <div class="stats">

            <div>
              <strong>RAM</strong> ${instance.default_ram}
            </div>

            <div>
              <strong>STORAGE</strong> ${cluster.diskSizeGB.$numberDouble} GB
            </div>

            <div>
              <strong>VERSION</strong> ${cluster.mongoDBVersion}
            </div>

          </div>

          <div class="footer">
            <a href="#" class="Cbtn Cbtn-primary modify-button" data-name="${cluster.name}">Modify</a>
            <a href="#" class="Cbtn Cbtn-warning pause-button" data-name="${cluster.name}">Pause</a>
            <a href="#" class="Cbtn Cbtn-danger delete-button" data-name="${cluster.name}">Delete</a>
          </div>
        </div>
      </div>
    </div>
    `
    placeholder.append(html);

  })
  // init
  initDeleteButtons();
  initPauseButtons();
}

// init buttons

function initPauseButtons() {
  var pauseButtons = $(`.pause-button`);

  $.each(pauseButtons, function(index, button) {
    $(button).click(function(e) {
      let item = $(this);
      // let paused = false;

      // TODO: check if pause or resume and modify accordingly


      $.ajax({
          url: `${baseURL}/pauseCluster`,
          method: 'PATCH',
          data: JSON.stringify({"clusterName":item.attr('data-name'), "paused":true})
        }).done(function(clusters) {
          loadClusters();
        })
        .fail(function(err) {
          console.log(err)
        });
    });
  })

}


function initDeleteButtons() {
  var deleteButtons = $(`.delete-button`);

  $.each(deleteButtons, function(index, button) {
    $(button).click(function(e) {
      let item = $(this);
      $.ajax({
          url: `${baseURL}/deleteCluster?clusterName=${item.attr('data-name')}`,
          method: 'DELETE'
        }).done(function(clusters) {
          loadClusters();
        })
        .fail(function(err) {
          console.log(err)
        });
    });
  })

}

// end init buttons


$(document).ready(function() {
  loadClusters();
});
