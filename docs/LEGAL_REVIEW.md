# Questions for legal and expert review

FESTIVA's builders are not lawyers or cultural authorities. These are the issues found while building it that need a professional before a public launch. Nothing here is legal advice.

## Data protection

1. **India: DPDP Act 2023 and DPDP Rules 2025.** The Rules were notified in November 2025, with the substantive duties (notice and consent, security safeguards, breach notification, verifiable parental consent for children) phased in over 18 months, to 14 May 2027. Questions:
   - Is the operator a Data Fiduciary for Gift Circle, accounts and sharing? Who is the contact person?
   - Do the consent notices (voice, preferences) meet the Rules' content requirements?
   - Retention periods and erasure on request for circles, shares and accounts.
   - Breach notification process.
2. **Children.** Indian law treats anyone under 18 as a child and requires verifiable parental consent before processing their data. Gift Circle has no age check; the join page says it is for adults. Decide whether to add an age declaration, a parental consent flow, or to keep circles adults-only. Check rules in other target countries (for example COPPA in the US for under-13s, GDPR Article 8 in the EU).
3. **Voice data.** Recordings may reveal health, accent, or other sensitive traits. Confirm that consent-per-recording, no storage and transfer to Sarvam AI are adequately disclosed, and review Sarvam's terms and data location.
4. **Cross-border transfers.** Flagsmith, NudgeBee, the hosting provider and any AI provider may process data outside India. Confirm permitted transfers and contracts (data processing agreements) with each.
5. **EU/UK users.** If the service is offered to them, GDPR/UK GDPR apply: lawful bases, records of processing, data protection impact assessment for voice, cookie-free analytics confirmation.
6. **Analytics and experiments.** FESTIVA counts hashed identifiers and respects Do Not Track and Global Privacy Control. Confirm this is sufficient in each market.

## Consumer and commercial

7. **Terms of service.** None exist. Needed for accounts, Gift Circle (user-generated content, removal of abuse) and sharing.
8. **Brands in Shop.** Shop names real brands as catalogue examples with links to their official sites and a statement that there is no affiliation. Confirm trademark use is acceptable and whether any brand objects.
9. **Money in Gift Circle.** FESTIVA records contribution commitments but does not handle money. Confirm this keeps it outside payment regulation, and that wording never implies FESTIVA holds funds.
10. **Music links.** Sound links to search results on licensed services and embeds no audio. Confirm.
11. **Accessibility law.** Automated accessibility checks pass on tested pages, but no manual audit or certification has been done (for example against the Rights of Persons with Disabilities Act, 2016, in India, or the European Accessibility Act).

## Cultural content

12. **Expert review.** No festival entry has been reviewed by a cultural or religious expert. Pages say so. Priorities for review: religious observances (Eid al-Fitr, Eid al-Adha, Diwali, Vesak, Thaipusam, Meskel, Timkat, Kandy Esala Perahera, Vodun Days) and Indigenous observances (Matariki, Garma, Sámi National Day, Inti Raymi, Guelaguetza). The workflow is in [CONTENT_REVIEW.md](CONTENT_REVIEW.md).
13. **Indigenous cultural and intellectual property.** Entries for Indigenous festivals describe public events at a general level and link to the communities' own organisations where possible. Check against community protocols (for example the Yothu Yindi Foundation's for Garma, and Sámi Council guidance) before promoting them.
14. **Contested history.** The Tweede Nuwe Jaar entry notes the debate over the carnival's former name and face paint. Have someone from the community review the wording.
