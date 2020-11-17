import { createCluster, getClusters } from "./webhooks.js";

var baseURL = `https://webhooks.mongodb-realm.com/api/client/v2.0/app/atlasconfigurator-xyznk/service/Atlas/incoming_webhook`;
var instances = [
  {
    instance_size: "M10",
    default_storage: "10 GB",
    default_ram: "2 GB",
  },
  {
    instance_size: "M20",
    default_storage: "20 GB",
    default_ram: "4 GB",
  },
  {
    instance_size: "M30",
    default_storage: "40 GB",
    default_ram: "8 GB",
  },
];

// helper functions

function grabInstance(instanceName) {
  return $.map(instances, function (e, i) {
    if (e.instance_size === instanceName) return e;
  });
}

function clearModal(formObject, modalID) {
  // reset form
  formObject.trigger("reset");
  // remove so no duplicates
  formObject.unbind("submit");
  // close active modal
  modalID.modal("toggle");
}

// end helper functions

// ~*~*~* createClusterModal ~~~*~*~~*

function initCreateClusterModal() {
  $("#createClusterModal").on("shown.bs.modal", function () {
    // cleanup
    let feedbackText = $("#createClusterFeedback");
    feedbackText.html("");

    // build select box
    var select = $("#createClusterRAMSelect");
    $.each(instances, function (index, instance) {
      select.append(
        `<option value="${instance.instance_size}">${instance.default_ram}</option>`
      );
    });

    $("#createClusterForm").on("submit", function () {
      // build json
      var obj = {};
      var form = $(this);

      $.each(form.serializeArray(), function () {
        // convert str to int
        obj[this.name] = this.value;

        // convert str to int
        if (this.name == "diskSizeGB") {
          obj.diskSizeGB = parseInt(this.value);
        }
      });
      // error handler
      function handleCreateError(err) {
        console.log(err);
        feedbackText.html(JSON.stringify(err.detail));
        return false;
      }

      createCluster("1", obj).then((result) => {
        if (result.error) {
          console.log(result);
        } else {
          loadClusters();
          clearModal(form, $("#createClusterModal"));
        }
      });

      return false;
    });
  });
}

// ~*~*~* page load ~~~*~*~~*

function loadClusters() {
  getClusters().then((clusters) => renderClusters(clusters));
}

function renderClusters(clusters) {
  var placeholder = $("#placeholder");
  // empty
  placeholder.html("");
  // let html = ``;
  $.each(clusters, function (index, cluster) {
    let instance = grabInstance(cluster.providerSettings.instanceSizeName)[0];

    let tags = ``;
    cluster.labels.forEach(function (tag) {
      if (tag.value !== "undefined") {
        tags += `<span><b>${tag.key}</b>: ${tag.value}</span>`;
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
                <input class="form-control" value="${
                  cluster.connectionStrings.standardSrv === undefined
                    ? "connection string waiting..."
                    : cluster.connectionStrings.standardSrv
                }">
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
              <strong>INSTANCE</strong> ${
                cluster.providerSettings.instanceSizeName
              }
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
            <a href="#" class="Cbtn Cbtn-primary modify-button" data-name="${
              cluster.name
            }">Modify</a>
            <a href="#" class="Cbtn Cbtn-warning pause-button" data-name="${
              cluster.name
            }">Pause</a>
            <a href="#" class="Cbtn Cbtn-danger delete-button" data-name="${
              cluster.name
            }">Delete</a>
          </div>
        </div>
      </div>
    </div>
    `;
    placeholder.append(html);
  });
  // init
  initDeleteButtons();
  initPauseButtons();
  // initSelects();
  initModifyButtons();
}

// ~*~*~* end page load ~~~*~*~~*

// ~*~*~* init buttons ~~~*~*~~*

function initModifyButtons() {
  let placeholder = $("#modifyModalPlaceholder");
  var modifyButtons = $(`.modify-button`);

  $.each(modifyButtons, function (index, button) {
    $(button).click(function (e) {
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
      `;
      placeholder.html(html);

      $("#modifyClusterModal").modal("toggle");
    });
  });
}

function initPauseButtons() {
  var pauseButtons = $(`.pause-button`);

  $.each(pauseButtons, function (index, button) {
    $(button).click(function (e) {
      let item = $(this);
      // let paused = false;

      // TODO: check if pause or resume and modify accordingly

      $.ajax({
        url: `${baseURL}/pauseCluster`,
        method: "POST",
        data: JSON.stringify({
          clusterName: item.attr("data-name"),
          paused: true,
        }),
        dataType: "json",
        contentType: "application/json",
      })
        .done(function (clusters) {
          loadClusters();
        })
        .fail(function (err) {
          console.log(err);
        });
    });
  });
}

function initDeleteButtons() {
  var deleteButtons = $(`.delete-button`);

  $.each(deleteButtons, function (index, button) {
    $(button).click(function (e) {
      let item = $(this);
      $.ajax({
        url: `${baseURL}/deleteCluster?clusterName=${item.attr("data-name")}`,
        method: "DELETE",
      })
        .done(function (clusters) {
          loadClusters();
        })
        .fail(function (err) {
          console.log(err);
        });
    });
  });
}

// ~*~*~* end init buttons ~~~*~*~~*

function handleCreateButton() {
  // put cookie in
  let stitchKey = "__stitch.client.atlasconfigurator-xyznk.auth_info";
  let stitchObj = localStorage.getItem(localStorage.key(stitchKey));

  if (stitchObj == null || stitchObj == "oauth2-google") {
    // your code here.
    $("#create-cluster-header-button").hide();
  } else {
    let parsedStitchObj = JSON.parse(stitchObj);
    let user_id = parsedStitchObject.user_id;

    if (typeof user_id !== "undefined") {
      console.log(user_id);
      localStorage.setItem("user_id", user_id);
      $("#login-header-button").hide();
    }
  }
}

$(document).ready(function () {
  loadClusters();
  initCreateClusterModal();
  //handleCreateButton();
});
