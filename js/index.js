var baseURL = `https://webhooks.mongodb-realm.com/api/client/v2.0/app/atlasconfigurator-xyznk/service/Atlas/incoming_webhook`
var instances = [{
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

function initCreateClusterModal(){
  $( "#createClusterModal" ).on('shown.bs.modal', function(){
    // cleanup
    let feedbackText = $('#createClusterFeedback')
    feedbackText.html('');

    // build select box
    var select = $('#createClusterRAMSelect');
    $.each(instances, function(index, instance) {
      select.append(`<option value="${instance.instance_size}">${instance.default_ram}</option>`);
    })
    //
    $("#createClusterForm").on("submit", function(){
      // build json
      var obj = {};
      $.each($(this).serializeArray(), function() {
        // convert str to int
        obj[this.name] = this.value;

        // fix up
        if (this.name == 'diskSizeGB'){
          obj.diskSizeGB = parseInt(this.value)
        }
      });
      // error handler
      function handleCreateError(err){
        console.log(err)
        feedbackText.html(JSON.stringify(err))
        return false;
      }

      // send json to api
      $.ajax({
          url: `${baseURL}/createCluster`,
          method: 'POST',
          data: JSON.stringify(obj),
          dataType: 'json',
          contentType: 'application/json'
        }).done(function(msg) {
          if ("error" in msg){
            handleCreateError(msg)
          }
          loadClusters();
        })
        .fail(function(err) {
          handleCreateError(err)
        });

        return false;

    })
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
  $.each(clusters, function(index, cluster) {

    let instance = grabInstance(cluster.providerSettings.instanceSizeName)[0];

    let tags = ``
    cluster.labels.forEach(function(tag) {
      if (tag.value !== 'undefined'){
        tags += `<span>${tag.value}</span>`;
      }
    });

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

            <div class="item-content-block tags">
              ${tags}
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
  // initSelects();
  initModifyButtons();
}

// init buttons

function initModifyButtons() {

  let placeholder = $('#modifyModalPlaceholder');
  var modifyButtons = $(`.modify-button`);

  $.each(modifyButtons, function(index, button) {
    $(button).click(function(e) {

      // build modal
      let html = `
        <div class="modal fade center-modal" id="modifyClusterModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Modify Cluster</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <form>
                  <div class="form-group row">
                    <label class="col-sm-2 col-form-label">Name</label>
                    <div class="col-sm-10">
                      <input type="name" class="form-control" placeholder="Cluster Name">
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-2 col-form-label">RAM</label>
                    <div class="col-sm-10">
                      <select name="ram" class="form-control">
                        <option>1</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-2 col-form-label">Storage</label>
                    <div class="col-sm-10">
                      <select name="storage" class="form-control">
                        <option>1</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group row">
                    <label class="col-sm-2 col-form-label">Version</label>
                    <div class="col-sm-10">
                      <select name="version" class="form-control">
                        <option>1</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary">Modify Cluster</button>
              </div>
            </div>
          </div>
        </div>
      `
      placeholder.html(html);

      $('#modifyClusterModal').modal('toggle');
    })
  })

}

function initPauseButtons() {
  var pauseButtons = $(`.pause-button`);

  $.each(pauseButtons, function(index, button) {
    $(button).click(function(e) {
      let item = $(this);
      // let paused = false;

      // TODO: check if pause or resume and modify accordingly


      $.ajax({
          url: `${baseURL}/pauseCluster`,
          method: 'POST',
          data: JSON.stringify({
            "clusterName": item.attr('data-name'),
            "paused": true
          }),
          dataType: 'json',
          contentType: 'application/json'
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
  initCreateClusterModal();
});
