// Configuración de IDs
var SPREADSHEET_ID = "1T8I7c0eZdWB36kT2F1gwQSVi4DVI9m9Bxgf-aiKwFIw";
var CALENDAR_ID = "c_852f50f5ab2c2b096be2f978442fd22e8d19f9f7705ee87be4abd4ef09ae4401@group.calendar.google.com";

// ===== Directorio del equipo (desplegable de mails) =====
// Para sumar o sacar a alguien, editá esta lista: ["Nombre", "mail"]
var DIRECTORIO = [
  ["Agostina Cicarilli", "acicarilli@wearemain.com"],
  ["Agustina Castro", "acastro@wearemain.com"],
  ["Amparo Collado", "acollado@wearemain.com"],
  ["Ayelén Asín", "aasin@wearemain.com"],
  ["Belen Turriaga", "bturriaga@wearemain.com"],
  ["Candelaria Jerez", "cjerez@wearemain.com"],
  ["Carolina Del Castillo", "cdelcastillo@wearemain.com"],
  ["Caterina Lardaro", "clardaro@wearemain.com"],
  ["Daniela Martinez", "dmartinez@wearemain.com"],
  ["Diego Calio", "dcalio@wearemain.com"],
  ["Esteban Gauna", "egauna@wearemain.com"],
  ["Federico Monasterio", "fmonasterio@wearemain.com"],
  ["Florencia Grinblat", "fgrinblat@wearemain.com"],
  ["Francisco Diaz Lima", "fdiazlima@wearemain.com"],
  ["Francisco Perez Abad", "fperez@wearemain.com"],
  ["Ghila Translateur", "gtranslateur@wearemain.com"],
  ["Guadalupe Fernandez", "gfernandez@wearemain.com"],
  ["Guadalupe Mansilla", "gmansilla@wearemain.com"],
  ["Joan González", "jgonzalez@wearemain.com"],
  ["Juan Manuel Querelos", "jquerelos@wearemain.com"],
  ["Lautaro Momberg", "lmomberg@wearemain.com"],
  ["Lucas Liu", "lliu@wearemain.com"],
  ["Lucrecia Rivas", "lrivas@wearemain.com"],
  ["Maria Eugenia Pittaluga", "mepittaluga@wearemain.com"],
  ["Maria Pilar Passamonte", "ppassamonte@wearemain.com"],
  ["Matias Mansilla", "mmansilla@wearemain.com"],
  ["Matías Sole", "msole@wearemain.com"],
  ["Mercedes Sanchez", "msanchez@wearemain.com"],
  ["Micaela Palotti", "mpalotti@wearemain.com"],
  ["Milagros Mut", "mmut@wearemain.com"],
  ["Priscila Lin", "plin@wearemain.com"],
  ["Sabina Roca", "sroca@wearemain.com"],
  ["Sofia Avalos", "savalos@wearemain.com"],
  ["Stefania Villella", "svillella@wearemain.com"],
  ["Tomas Montobbio", "tmontobbio@wearemain.com"],
  ["Yair Bataglia", "ybataglia@wearemain.com"],
  ["Administración", "administracion@wearemain.com"],
  ["Desarrollo", "desarrollo@wearemain.com"],
  ["People", "people@wearemain.com"],
  ["", "ngullifa@wearemain.com"],
  ["", "rdepiano@wearemain.com"]
];

function getDirectorio() {
  return DIRECTORIO.map(function(p) {
    return { nombre: p[0], email: p[1] };
  });
}

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('main. - Reserva de Salas')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getCalendarioSalas() {
  var cal = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!cal) throw new Error("No se pudo acceder al calendario de salas.");
  return cal;
}

function formatearHoraLimpia(valorHora, timeZone) {
  if (!valorHora) return "00:00";
  if (valorHora instanceof Date) {
    return Utilities.formatDate(valorHora, timeZone, "HH:mm");
  }
  var str = String(valorHora).trim();
  if (str.indexOf("GMT") !== -1 || str.indexOf("1899") !== -1) {
    var d = new Date(str);
    if (!isNaN(d.getTime())) {
      return Utilities.formatDate(d, timeZone, "HH:mm");
    }
  }
  return str;
}

function normalizarFecha(fechaVal, timeZone) {
  if (!fechaVal) return "";
  if (fechaVal instanceof Date) {
    return Utilities.formatDate(fechaVal, timeZone, "yyyy-MM-dd");
  }
  var str = String(fechaVal).trim();
  if (str.indexOf("/") !== -1) {
    var partes = str.split("/");
    if (partes.length === 3) {
      return partes[2] + "-" + partes[1].padStart(2, '0') + "-" + partes[0].padStart(2, '0');
    }
  }
  return str;
}

function horaAMinutos(horaStr) {
  if (!horaStr) return 0;
  var partes = String(horaStr).split(':');
  var h = parseInt(partes[0], 10) || 0;
  var m = parseInt(partes[1], 10) || 0;
  return (h * 60) + m;
}

function obtenerTodasLasReservasDelDia(fechaConsultaStr) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var timeZone = Session.getScriptTimeZone();

  var lista = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var usuario = String(row[2]).split(' ')[0];
    var nombreSala = String(row[3]);
    var fechaReserva = row[4];
    var horaInicio = formatearHoraLimpia(row[5], timeZone);
    var horaFin = formatearHoraLimpia(row[6], timeZone);
    var estado = row[9];

    var fechaRowStr = normalizarFecha(fechaReserva, timeZone);

    if (estado === "Confirmada" && fechaRowStr === fechaConsultaStr) {
      lista.push({
        sala: nombreSala,
        usuario: usuario,
        horaInicio: horaInicio,
        horaFin: horaFin,
        fecha: fechaRowStr
      });
    }
  }

  lista.sort(function(a, b) {
    if (a.sala < b.sala) return -1;
    if (a.sala > b.sala) return 1;
    return horaAMinutos(a.horaInicio) - horaAMinutos(b.horaInicio);
  });

  return lista;
}

function obtenerEstadoSalasPorHora(fechaConsultaStr, horaConsultaStr) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var timeZone = Session.getScriptTimeZone();

  var ahora = new Date();
  var fechaConsulta = fechaConsultaStr || Utilities.formatDate(ahora, timeZone, "yyyy-MM-dd");
  var horaConsulta = horaConsultaStr || Utilities.formatDate(ahora, timeZone, "HH:mm");

  var minutosConsulta = horaAMinutos(horaConsulta);

  var salas = {
    "Sala 1": { reservada: false, nombre: "", motivo: "", horario: "", idEvento: "" },
    "Sala 2": { reservada: false, nombre: "", motivo: "", horario: "", idEvento: "" },
    "Sala 3": { reservada: false, nombre: "", motivo: "", horario: "", idEvento: "" },
    "Sala 4": { reservada: false, nombre: "", motivo: "", horario: "", idEvento: "" }
  };

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var usuarioYEmail = row[2];
    var nombreSala = row[3];
    var fechaReserva = row[4];
    var horaInicio = formatearHoraLimpia(row[5], timeZone);
    var horaFin = formatearHoraLimpia(row[6], timeZone);
    var motivo = row[7];
    var idEvento = row[8];
    var estado = row[9];

    if (!nombreSala || !salas[nombreSala]) continue;

    var fechaRowStr = normalizarFecha(fechaReserva, timeZone);

    if (estado === "Confirmada" && fechaRowStr === fechaConsulta) {
      var minInicio = horaAMinutos(horaInicio);
      var minFin = horaAMinutos(horaFin);

      if (minutosConsulta >= minInicio && minutosConsulta < minFin) {
        salas[nombreSala] = {
          reservada: true,
          nombre: usuarioYEmail,
          motivo: motivo || "Reunión",
          horario: horaInicio + " - " + horaFin + " hs",
          idEvento: idEvento
        };
      }
    }
  }

  return salas;
}

function obtenerReservasRango(fechaInicioStr, fechaFinStr) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var timeZone = Session.getScriptTimeZone();

  var reservas = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var fechaReserva = row[4];
    var estado = row[9];

    var fechaRowStr = normalizarFecha(fechaReserva, timeZone);

    if (estado === "Confirmada" && fechaRowStr >= fechaInicioStr && fechaRowStr <= fechaFinStr) {
      reservas.push({
        sala: String(row[3]),
        usuario: String(row[2]).split(' ')[0],
        fecha: fechaRowStr,
        horaInicio: formatearHoraLimpia(row[5], timeZone),
        horaFin: formatearHoraLimpia(row[6], timeZone)
      });
    }
  }

  reservas.sort(function(a, b) {
    if (a.fecha < b.fecha) return -1;
    if (a.fecha > b.fecha) return 1;
    if (a.sala < b.sala) return -1;
    if (a.sala > b.sala) return 1;
    return horaAMinutos(a.horaInicio) - horaAMinutos(b.horaInicio);
  });

  return reservas;
}

// Separa mails por coma, punto y coma o espacios; descarta inválidos y repetidos
function parsearEmails(texto) {
  if (!texto) return [];
  var vistos = {};
  return String(texto).split(/[,;\s]+/)
    .map(function(e) { return e.trim().toLowerCase(); })
    .filter(function(e) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || vistos[e]) return false;
      vistos[e] = true;
      return true;
    });
}

// Requiere el servicio avanzado "Google Calendar API" (identificador: Calendar)
function guardarReserva(nombreSala, nombrePersona, emailUsuario, fechaReserva, horaInicio, horaFin, motivo, invitadosExtra) {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    var fechaActual = new Date();
    var timeZone = Session.getScriptTimeZone();
    var idReserva = "RES-" + fechaActual.getTime();

    var tituloEvento = nombreSala + ": " + (motivo || "Reunión") + " - " + nombrePersona;

    // El que reserva va primero; después los invitados extra (sin repetidos)
    var emails = parsearEmails(emailUsuario + "," + (invitadosExtra || ""));

    var recurso = {
      summary: tituloEvento,
      description: "Reservado por: " + nombrePersona + " (" + emailUsuario + ")",
      start: { dateTime: fechaReserva + "T" + horaInicio + ":00", timeZone: timeZone },
      end: { dateTime: fechaReserva + "T" + horaFin + ":00", timeZone: timeZone },
      attendees: emails.map(function(e) { return { email: e, responseStatus: "accepted" }; }),
      conferenceData: {
        createRequest: {
          requestId: idReserva,
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      }
    };

    var creado = Calendar.Events.insert(recurso, CALENDAR_ID, {
      conferenceDataVersion: 1,
      sendUpdates: "all"
    });

    // iCalUID es el formato que entiende CalendarApp.getEventById (lo usa liberarSala)
    var eventId = creado.iCalUID || creado.id;
    var meetLink = creado.hangoutLink || "";
    var invitadosLista = emails.slice(1);

    sheet.appendRow([
      idReserva,
      fechaActual,
      nombrePersona + " (" + emailUsuario + ")",
      nombreSala,
      fechaReserva,
      horaInicio,
      horaFin,
      motivo || "Sin descripción",
      eventId,
      "Confirmada",
      invitadosLista.join(", "),     // columna K: invitados extra
      meetLink                       // columna L: link de Meet
    ]);

    // Envío de HTML Mailing alineado al Brandbook MAIN 2026
    try {
      enviarMailConfirmacion({
        nombre: nombrePersona,
        email: emailUsuario,
        invitados: invitadosLista,
        sala: nombreSala,
        fecha: fechaReserva,
        horaInicio: horaInicio,
        horaFin: horaFin,
        motivo: motivo || "Reunión",
        meetLink: meetLink
      });
    } catch (mailErr) {
      Logger.log("Aviso: No se pudo enviar el mail de confirmación: " + mailErr.message);
    }

    return obtenerEstadoSalasPorHora(fechaReserva, horaInicio);
  } catch (err) {
    throw new Error("Error al procesar reserva: " + err.message);
  }
}

// ===== HTML MAILING OFICIAL (BRANDBOOK MAIN 2026) =====
function enviarMailConfirmacion(datos) {
  var logoUrl = "https://reservas.wearemain.com/logo-blanco-sin-bajada.png";
  var partesFecha = String(datos.fecha).split("-");
  var fechaLegible = partesFecha.length === 3
    ? partesFecha[2] + "/" + partesFecha[1] + "/" + partesFecha[0]
    : datos.fecha;

  var bloqueInvitados = (datos.invitados && datos.invitados.length > 0)
    ? '<tr>' +
        '<td style="padding:8px 0;font-family:\'Roboto\',Arial,sans-serif;font-size:13px;color:#0e0f11;border-top:1px solid #e2e8f0;">' +
          '<strong style="font-family:\'Poppins\',Arial,sans-serif;font-weight:600;color:#193760;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Invitados:</strong><br>' +
          datos.invitados.join(", ") +
        '</td>' +
      '</tr>'
    : '';

  var botonMeet = datos.meetLink
    ? '<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px 0;">' +
        '<tr>' +
          '<td align="center" bgcolor="#3271ed" style="border-radius:8px;background-color:#3271ed;">' +
            '<a href="' + datos.meetLink + '" target="_blank" style="display:inline-block;padding:12px 24px;font-family:\'Poppins\',Arial,sans-serif;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;">' +
              'Unirse a Google Meet' +
            '</a>' +
          '</td>' +
        '</tr>' +
      '</table>'
    : '';

  var htmlBody = '' +
    '<!DOCTYPE html>' +
    '<html lang="es">' +
    '<head>' +
      '<meta charset="utf-8">' +
      '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;900&family=Roboto:wght@400;700&display=swap" rel="stylesheet">' +
    '</head>' +
    '<body style="margin:0;padding:0;background-color:#f2f2f2;font-family:\'Roboto\',Arial,sans-serif;color:#0e0f11;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f2f2;padding:32px 12px;">' +
        '<tr>' +
          '<td align="center">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">' +
              '<tr>' +
                '<td bgcolor="#0e0f11" style="background-color:#0e0f11;padding:28px 32px;text-align:left;">' +
                  '<img src="' + logoUrl + '" alt="main." height="32" style="display:block;border:0;outline:none;background:transparent;">' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="height:4px;background-color:#3271ed;background:linear-gradient(90deg,#3271ed 0%,#c429cc 100%);font-size:0;line-height:0;">&nbsp;</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding:32px;">' +
                  '<div style="display:inline-block;background-color:#2bccb1;color:#0e0f11;font-family:\'Poppins\',Arial,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:4px 10px;border-radius:20px;margin-bottom:14px;">' +
                    'Reserva Confirmada' +
                  '</div>' +
                  '<h1 style="font-family:\'Poppins\',Arial,sans-serif;font-weight:700;font-size:21px;line-height:1.3;color:#0e0f11;margin:0 0 10px 0;">' +
                    'Hola ' + datos.nombre + ', tu sala ya está agendada' +
                  '</h1>' +
                  '<p style="font-family:\'Roboto\',Arial,sans-serif;font-size:14px;line-height:1.6;color:#0e0f11;margin:0 0 22px 0;">' +
                    'El evento quedó confirmado automáticamente en el calendario de salas y en las agendas de los participantes.' +
                  '</p>' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f2f2;border-left:4px solid #3271ed;border-radius:8px;">' +
                    '<tr>' +
                      '<td style="padding:18px 20px;">' +
                        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
                          '<tr>' +
                            '<td style="padding:0 0 8px 0;font-family:\'Roboto\',Arial,sans-serif;font-size:14px;color:#0e0f11;">' +
                              '<strong style="font-family:\'Poppins\',Arial,sans-serif;font-weight:600;color:#193760;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Sala:</strong><br>' +
                              '<span style="font-family:\'Poppins\',Arial,sans-serif;font-weight:700;font-size:16px;color:#0e0f11;">' + datos.sala + '</span>' +
                            '</td>' +
                          '</tr>' +
                          '<tr>' +
                            '<td style="padding:8px 0;font-family:\'Roboto\',Arial,sans-serif;font-size:14px;color:#0e0f11;border-top:1px solid #e2e8f0;">' +
                              '<strong style="font-family:\'Poppins\',Arial,sans-serif;font-weight:600;color:#193760;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Fecha y Horario:</strong><br>' +
                              '<strong>' + fechaLegible + '</strong> &middot; ' + datos.horaInicio + ' a ' + datos.horaFin + ' hs' +
                            '</td>' +
                          '</tr>' +
                          '<tr>' +
                            '<td style="padding:8px 0;font-family:\'Roboto\',Arial,sans-serif;font-size:14px;color:#0e0f11;border-top:1px solid #e2e8f0;">' +
                              '<strong style="font-family:\'Poppins\',Arial,sans-serif;font-weight:600;color:#193760;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Motivo:</strong><br>' +
                              datos.motivo +
                            '</td>' +
                          '</tr>' +
                          bloqueInvitados +
                        '</table>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +
                  botonMeet +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="background-color:#f2f2f2;padding:18px 32px;border-top:1px solid #e5e7eb;text-align:left;">' +
                  '<p style="font-family:\'Poppins\',Arial,sans-serif;font-weight:600;font-size:11px;color:#0e0f11;margin:0 0 2px 0;">' +
                    'main. <span style="font-weight:500;color:#193760;">| Sistema de Reserva de Salas</span>' +
                  '</p>' +
                  '<p style="font-family:\'Roboto\',Arial,sans-serif;font-size:11px;color:#64748b;margin:0;">' +
                    'wearemain.com &middot; hola@wearemain.com' +
                  '</p>' +
                '</td>' +
              '</tr>' +
            '</table>' +
          '</td>' +
        '</tr>' +
      '</table>' +
    '</body>' +
    '</html>';

  var opciones = {
    htmlBody: htmlBody,
    name: 'main. - Reserva de Salas'
  };

  if (datos.invitados && datos.invitados.length > 0) {
    opciones.cc = datos.invitados.join(",");
  }

  GmailApp.sendEmail(
    datos.email,
    'Reserva Confirmada: ' + datos.sala + ' (' + fechaLegible + ' · ' + datos.horaInicio + ' hs)',
    'Tu reserva en ' + datos.sala + ' para el ' + fechaLegible + ' de ' + datos.horaInicio + ' a ' + datos.horaFin + ' hs está confirmada.',
    opciones
  );
}

function liberarSala(nombreSala, fechaConsulta, horaConsulta) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var calendar = getCalendarioSalas();
  var timeZone = Session.getScriptTimeZone();

  for (var i = 1; i < data.length; i++) {
    var rowSala = data[i][3];
    var rowFecha = data[i][4];
    var rowEstado = data[i][9];
    var rowEventId = data[i][8];

    var fechaStr = normalizarFecha(rowFecha, timeZone);

    if (rowSala === nombreSala && rowEstado === "Confirmada" && fechaStr === fechaConsulta) {
      sheet.getRange(i + 1, 10).setValue("Cancelada");

      if (rowEventId) {
        try {
          var event = calendar.getEventById(rowEventId);
          if (event) event.deleteEvent();
        } catch (e) {}
      }
      break;
    }
  }

  return obtenerEstadoSalasPorHora(fechaConsulta, horaConsulta);
}
